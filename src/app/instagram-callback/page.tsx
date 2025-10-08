'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getInstagramAccessToken, getInstagramUserDetails, exchangeForLongLivedToken } from '@/ai/flows/instagram-auth';
import { getFirestore, doc, collection, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';

// Initialize Firebase client-side if not already done
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const firestore = getFirestore();

function InstagramCallbackContent() {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('Connecting your account, please wait...');

    useEffect(() => {
        const handleAuth = async () => {
            const code = searchParams.get('code');
            const authError = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            // In a real app, the 'state' param should be used to fetch the user ID securely.
            // For this demo/uploader context, we'll assume a single user context for simplicity.
            // This is a major simplification. A real implementation would involve validating the state parameter.
            const userId = "DEFAULT_USER"; // This MUST be replaced in a multi-user environment.

            if (authError) {
                setError(errorDescription || 'The connection was denied or an unknown error occurred.');
                setMessage('Connection Failed');
                return;
            }

            if (!code) {
                setError('No authorization code was provided by Instagram.');
                setMessage('Connection Failed');
                return;
            }

            try {
                // Step 1: Fetch credentials saved by the user
                const credsRef = doc(firestore, 'users', userId, 'platformCredentials', 'Instagram');
                const credsSnap = await getDoc(credsRef);
                if (!credsSnap.exists() || !credsSnap.data()?.clientId || !credsSnap.data()?.clientSecret) {
                    throw new Error("Instagram credentials are not configured. Please save your App ID and Secret on the API Keys page.");
                }
                const credentials = credsSnap.data() as PlatformCredentials;

                // Step 2: Construct the exact same redirect URI used to initiate the auth flow
                // This is the critical part that must match what's in the .env file
                const redirectUri = `${process.env.NEXT_PUBLIC_URL}${process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI}`;
                
                if (!process.env.NEXT_PUBLIC_URL || !process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI) {
                    throw new Error("Application URL or redirect URI is not configured in the environment settings.");
                }

                // Step 3: Exchange code for short-lived token
                const { accessToken: shortLivedToken } = await getInstagramAccessToken({
                    code,
                    clientId: credentials.clientId!,
                    clientSecret: credentials.clientSecret!,
                    redirectUri: redirectUri,
                });

                // Step 4: Exchange short-lived token for a long-lived one
                const { longLivedToken } = await exchangeForLongLivedToken({
                    shortLivedToken,
                    clientId: credentials.clientId!,
                    clientSecret: credentials.clientSecret!
                });

                // Step 5: Get user details using the long-lived token
                const { username, instagramId, facebookPageId, facebookPageName, pageAccessToken } = await getInstagramUserDetails({
                    accessToken: longLivedToken
                });

                // Step 6: Save the connected account(s) to Firestore
                const socialMediaAccountsCollection = collection(firestore, `users/${userId}/socialMediaAccounts`);

                if (instagramId) {
                    const accountDocRef = doc(socialMediaAccountsCollection, instagramId);
                    const accountData: Omit<SocialMediaAccount, 'id'> = {
                        userId: userId,
                        platform: 'Instagram',
                        accessToken: longLivedToken,
                        pageAccessToken: pageAccessToken,
                        username: username,
                        instagramId: instagramId,
                        facebookPageId: facebookPageId,
                        facebookPageName: facebookPageName,
                        connected: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    await setDoc(accountDocRef, accountData, { merge: true });
                }

                if (facebookPageId && facebookPageName) {
                    const fbAccountDocRef = doc(socialMediaAccountsCollection, facebookPageId);
                    const fbAccountData: Omit<SocialMediaAccount, 'id'> = {
                      userId: userId,
                      platform: 'Facebook',
                      accessToken: longLivedToken,
                      pageAccessToken: pageAccessToken,
                      username: facebookPageName,
                      instagramId: instagramId,
                      facebookPageId: facebookPageId,
                      facebookPageName: facebookPageName,
                      connected: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                     await setDoc(fbAccountDocRef, fbAccountData, { merge: true });
                }
                
                setMessage('Connection successful! Redirecting you back to the app...');
                window.location.href = '/uploader_panel?view=connected-accounts&success=true';

            } catch (err: any) {
                console.error('Authentication handling failed:', err);
                setError(err.message || 'An unknown error occurred while finalizing the connection.');
                setMessage('Connection Failed');
            }
        };

        handleAuth();

    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-md">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">
                    {error ? 'Connection Problem' : 'Connecting to Instagram'}
                </h1>
                <p className={`text-slate-600 mb-6 ${error ? 'text-red-600' : ''}`}>
                    {error || message}
                </p>
                {!error && <LoaderCircle className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />}
                {error && (
                    <a href="/uploader_panel?view=api-keys" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700">
                        Return to API Keys
                    </a>
                )}
            </div>
        </div>
    );
}

export default function InstagramCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InstagramCallbackContent />
        </Suspense>
    );
}

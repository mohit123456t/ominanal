'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getInstagramAccessToken, exchangeForLongLivedToken, getInstagramUserDetails } from '@/ai/flows/instagram-auth';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, collection, setDoc } from 'firebase/firestore';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';

export default function InstagramCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('Connecting your account, please wait...');

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (error) {
            return; // Don't process if there's already an error from a previous attempt
        }
        
        if (searchParams.get('error')) {
            setError(`Connection failed: ${searchParams.get('error_description') || 'You denied the connection request.'}`);
            return;
        }

        if (!code) {
            setError('Invalid request. The authorization code is missing.');
            return;
        }
        
        if (!state) {
            setError('Invalid request. State (user identification) is missing.');
            return;
        }
        
        if(!user || user.uid !== state) {
            setError('Authentication error: The logged-in user does not match the user who initiated the connection.');
            return;
        }

        const processToken = async () => {
            if (!firestore) {
                setError('Database service is not available. Please try again later.');
                return;
            }

            try {
                // 1. Fetch user's saved credentials from Firestore
                const credsRef = doc(firestore, 'users', user.uid, 'platformCredentials', 'Instagram');
                const credsSnap = await getDoc(credsRef);
                if (!credsSnap.exists()) {
                    throw new Error("Instagram credentials are not configured. Please save them on the API Keys page first.");
                }
                const credentials = credsSnap.data() as PlatformCredentials;

                // 2. Construct the exact same redirect URI that was used to initiate the auth flow
                const redirectUri = `${process.env.NEXT_PUBLIC_URL}${process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI}`;
                if (!process.env.NEXT_PUBLIC_URL || !process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI) {
                     throw new Error("Client-side environment variables for redirect URI are not set.");
                }
               
                // 3. Get Short-Lived Token
                setMessage('Exchanging authorization code for token...');
                const { accessToken: shortLivedToken } = await getInstagramAccessToken({
                    code,
                    clientId: credentials.clientId!,
                    clientSecret: credentials.clientSecret!,
                    redirectUri: redirectUri,
                });

                // 4. Exchange for Long-Lived Token
                setMessage('Securing long-lived session...');
                const { longLivedToken } = await exchangeForLongLivedToken({
                    shortLivedToken,
                    clientId: credentials.clientId!,
                    clientSecret: credentials.clientSecret!
                });
                
                // 5. Get User Details
                setMessage('Fetching account details...');
                const { username, instagramId, facebookPageId, facebookPageName, pageAccessToken } = await getInstagramUserDetails({
                    accessToken: longLivedToken
                });

                // 6. Save accounts to Firestore
                setMessage('Saving your connected accounts...');
                const socialMediaAccountsCollection = collection(firestore, `users/${user.uid}/socialMediaAccounts`);

                if (instagramId) {
                    const accountDocRef = doc(socialMediaAccountsCollection, instagramId);
                    const accountData: Omit<SocialMediaAccount, 'id'> = {
                        userId: user.uid,
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
                        userId: user.uid,
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
                
                // 7. Redirect on Success
                setMessage('Connection successful! Redirecting...');
                router.push('/uploader_panel?view=connected-accounts&success=true');

            } catch (err: any) {
                console.error('Full callback processing error:', err);
                setError(err.message || 'An unknown error occurred during the connection process.');
            }
        };

        processToken();
    }, [searchParams, user, firestore, router, error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-background p-4">
            {error ? (
                <div className="max-w-md text-center bg-destructive/10 text-destructive p-6 rounded-lg border border-destructive/20">
                    <h1 className="text-xl font-bold">Connection Failed</h1>
                    <p className="mt-2 text-sm">{error}</p>
                    <Button onClick={() => router.push('/uploader_panel?view=api-keys')} className="mt-4">
                        Return to API Keys
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-medium text-muted-foreground">{message}</p>
                </div>
            )}
        </div>
    );
}

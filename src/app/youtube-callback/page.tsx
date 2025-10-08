
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, collection, setDoc } from 'firebase/firestore';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function YouTubeCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('Connecting your YouTube account, please wait...');

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (error) {
            return;
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
                // 1. Fetch credentials
                const credsRef = doc(firestore, 'users', user.uid, 'platformCredentials', 'YouTube');
                const credsSnap = await getDoc(credsRef);
                if (!credsSnap.exists()) {
                    throw new Error("YouTube credentials are not configured. Please save them on the API Keys page first.");
                }
                const credentials = credsSnap.data() as PlatformCredentials;

                // 2. Construct redirect URI
                const redirectUri = `${window.location.origin}${process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI}`;
                if (!process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI) {
                     throw new Error("Client-side environment variables for YouTube redirect URI are not set.");
                }

                // 3. Get Tokens
                setMessage('Exchanging authorization code for tokens...');
                const { accessToken, refreshToken } = await getYoutubeTokens({
                    code,
                    clientId: credentials.clientId!,
                    clientSecret: credentials.clientSecret!,
                    redirectUri: redirectUri,
                });

                // 4. Get Channel Details
                setMessage('Fetching channel details...');
                const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${accessToken}`;
                const channelResponse = await fetch(youtubeApiUrl);
                const channelData = await channelResponse.json();
                
                if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
                    console.error("YouTube API Error:", channelData);
                    throw new Error("Could not fetch YouTube channel details. The access token might be invalid or permissions are missing.");
                }
                
                const channelId = channelData.items[0].id;
                const channelName = channelData.items[0]?.snippet?.title || 'YouTube Account';
                
                // 5. Save Account
                setMessage('Saving your connected account...');
                const socialMediaAccountsCollection = collection(firestore, 'users', user.uid, 'socialMediaAccounts');
                const accountDocRef = doc(socialMediaAccountsCollection, channelId);

                const newAccountData: Omit<SocialMediaAccount, 'id'> = {
                    userId: user.uid,
                    platform: 'YouTube',
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    connected: true,
                    username: channelName,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                await setDoc(accountDocRef, newAccountData, { merge: true });

                // 6. Redirect on Success
                setMessage('Connection successful! Redirecting...');
                router.push('/uploader_panel?view=connected-accounts&success=true');

            } catch (err: any) {
                console.error('Full YouTube callback error:', err);
                setError(err.message || 'An unknown error occurred while connecting to YouTube.');
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

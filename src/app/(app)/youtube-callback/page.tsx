'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getYoutubeTokensAction } from '@/actions/youtube';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, addDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { type SocialMediaAccount, type PlatformCredentials } from '@/lib/types';

function YouTubeCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Connecting to YouTube...');
  const effectRan = useRef(false);


  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Failed to connect to YouTube: ${errorParam}`);
      toast({
        variant: 'destructive',
        title: 'YouTube Connection Failed',
        description: 'The connection was denied or an error occurred.',
      });
      setTimeout(() => router.push('/connected-accounts'), 3000);
      return;
    }

    if (code && user && firestore) {
      const handleTokenExchange = async () => {
        try {
          setMessage('Looking up your API credentials...');
          const credsRef = doc(firestore, 'users', user.uid, 'platformCredentials', 'YouTube');
          const credsSnap = await getDoc(credsRef);
          
          if (!credsSnap.exists()) {
            throw new Error("Could not find YouTube credentials. Please save your Client ID and Secret in the API Credentials page first.");
          }
          const credentials = credsSnap.data() as PlatformCredentials;
          
          if (!credentials.clientId || !credentials.clientSecret) {
            throw new Error("Client ID or Client Secret is missing from your saved credentials.");
          }
          
          setMessage('Exchanging authorization code for tokens...');
          const { accessToken, refreshToken } = await getYoutubeTokensAction({ 
              code, 
              clientId: credentials.clientId, 
              clientSecret: credentials.clientSecret 
          });

           setMessage('Fetching channel details...');
           const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${accessToken}`;
           const channelResponse = await fetch(youtubeApiUrl);
           const channelData = await channelResponse.json();

            if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
                console.error("YouTube API Error:", channelData);
                throw new Error("Could not fetch YouTube channel details.");
            }
            const channelName = channelData.items[0]?.snippet?.title || 'YouTube Account';


          setMessage('Saving your connection...');
          const socialMediaAccountsCollection = collection(firestore, 'users', user.uid, 'socialMediaAccounts');
          
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
          await addDoc(socialMediaAccountsCollection, newAccountData);

          toast({
            title: 'YouTube Account Connected!',
            description: `Successfully connected "${channelName}".`,
          });

          router.push('/connected-accounts');
        } catch (err: any) {
          console.error('Failed to exchange token or save account:', err);
          let errorMessage = err.message || 'An error occurred while finalizing the connection.';
          if (err.response?.data?.error_description) {
            errorMessage = err.response.data.error_description;
          }
          setError(errorMessage);
          toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: errorMessage,
          });
          setTimeout(() => router.push('/api-keys'), 5000);
        }
      };

      handleTokenExchange();
    } else if (!user || !firestore) {
        // Wait for user and firestore to be available
        setMessage("Waiting for user session...");
    }
     else if (!code) {
      setError('Invalid request. No authorization code found.');
      setTimeout(() => router.push('/api-keys'), 3000);
    }
  }, [searchParams, router, user, firestore, toast]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4 text-center p-4">
      {error ? (
        <>
          <h1 className="text-xl font-semibold text-destructive">Connection Failed</h1>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting you back...</p>
        </>
      ) : (
        <>
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          <h1 className="text-xl font-semibold">{message}</h1>
          <p className="text-muted-foreground">Please wait while we finalize the connection. Do not close this tab.</p>
        </>
      )}
    </div>
  );
}


export default function YouTubeCallbackPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><LoaderCircle className="h-10 w-10 animate-spin text-primary" /></div>}>
            <YouTubeCallback />
        </Suspense>
    )
}

'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
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

  const credsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'platformCredentials');
  }, [user, firestore]);
  
  const { data: credentialsList, isLoading: isLoadingCreds } = useCollection<PlatformCredentials>(credsCollectionRef);

  useEffect(() => {
    if (effectRan.current || !user || !firestore || isLoadingCreds) {
      if (!user) setMessage("Waiting for user session...");
      if (isLoadingCreds) setMessage("Loading credentials...");
      return;
    }

    if (!credentialsList || credentialsList.length === 0) {
      setError("YouTube credentials not found. Please save them on the API Keys page.");
      toast({ variant: 'destructive', title: 'Connection Failed', description: "YouTube credentials not found." });
      setTimeout(() => router.push('/api-keys'), 3000);
      return;
    }
    
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

    if (!code) {
      setError('Invalid request. No authorization code found.');
      setTimeout(() => router.push('/api-keys'), 3000);
      return;
    }
    
    const youtubeCreds = credentialsList.find(c => c.platform === 'YouTube');
    if (!youtubeCreds?.clientId || !youtubeCreds?.clientSecret) {
        setError("YouTube credentials are not configured correctly.");
        toast({ variant: 'destructive', title: 'Connection Failed', description: "Incomplete YouTube credentials." });
        setTimeout(() => router.push('/api-keys'), 3000);
        return;
    }


    const handleTokenExchange = async () => {
      try {
        setMessage('Exchanging authorization code for tokens...');
        const { accessToken, refreshToken } = await getYoutubeTokens({ 
            code,
            clientId: youtubeCreds.clientId!,
            clientSecret: youtubeCreds.clientSecret!,
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
  }, [searchParams, router, user, firestore, toast, credentialsList, isLoadingCreds]);

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

    
'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getInstagramAccessToken, getInstagramUserDetails } from '@/ai/flows/instagram-auth';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, addDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { type SocialMediaAccount, type PlatformCredentials } from '@/lib/types';

function InstagramCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Connecting to Instagram & Facebook...');
  
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current || !user || !firestore) return;
    effectRan.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Connection failed: ${searchParams.get('error_description') || errorParam}`);
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'The connection was denied or an error occurred.',
      });
      setTimeout(() => router.push('/connected-accounts'), 3000);
      return;
    }

    if (!code) {
        setError('Invalid request. No authorization code found.');
        setTimeout(() => router.push('/connected-accounts'), 3000);
        return;
    }

    const handleTokenExchange = async () => {
      try {
        setMessage('Looking up your API credentials...');
        const credsRef = doc(firestore, 'users', user.uid, 'platformCredentials', 'Instagram');
        const credsSnap = await getDoc(credsRef);

        if (!credsSnap.exists()) {
          throw new Error("Could not find Instagram credentials. Please save your App ID and Secret in the API Credentials page first.");
        }

        const credentials = credsSnap.data() as PlatformCredentials;
        
        if (!credentials.clientId || !credentials.clientSecret) {
          throw new Error("Client ID or Client Secret is missing from your saved credentials.");
        }
        
        setMessage('Exchanging authorization code for access token...');
        const { accessToken } = await getInstagramAccessToken({ 
            code, 
            clientId: credentials.clientId, 
            clientSecret: credentials.clientSecret 
        });
        
        if (!accessToken) {
          throw new Error('Failed to retrieve a valid access token.');
        }

        setMessage('Fetching your account details...');
        const { username, instagramId, facebookPageId, facebookPageName, pageAccessToken } = await getInstagramUserDetails({ 
            accessToken: accessToken, 
            clientId: credentials.clientId, 
            clientSecret: credentials.clientSecret 
        });

        setMessage('Saving your connection...');
        const socialMediaAccountsCollection = collection(firestore, `users/${user.uid}/socialMediaAccounts`);
        
        const newAccountData: Omit<SocialMediaAccount, 'id'> = {
          userId: user.uid,
          credentialsId: 'Instagram',
          platform: 'Instagram',
          accessToken: accessToken,
          pageAccessToken: pageAccessToken,
          connected: true,
          username: username,
          instagramId: instagramId,
          facebookPageId: facebookPageId,
          facebookPageName: facebookPageName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addDoc(socialMediaAccountsCollection, newAccountData);

        toast({
          title: 'Account Connected!',
          description: `Successfully connected Instagram as @${username} and Facebook Page "${facebookPageName}".`,
        });

        router.push('/connected-accounts');

      } catch (err: any) {
        console.error('Failed to exchange token or save account:', err);
        setError(err.message || 'An error occurred while finalizing the connection.');
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: err.message || 'Could not save your account connection. Please try again.',
        });
        setTimeout(() => router.push('/api-keys'), 5000);
      }
    };

    handleTokenExchange();
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
          <p className="text-muted-foreground">Please wait. Do not close this tab.</p>
        </>
      )}
    </div>
  );
}


export default function InstagramCallbackPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><LoaderCircle className="h-10 w-10 animate-spin text-primary" /></div>}>
            <InstagramCallback />
        </Suspense>
    )
}

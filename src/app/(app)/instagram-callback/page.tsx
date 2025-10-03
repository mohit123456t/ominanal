'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getInstagramAccessToken, getInstagramUserDetails } from '@/ai/flows/instagram-auth';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { type SocialMediaAccount } from '@/lib/types';

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
    if (effectRan.current) return;
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
      setTimeout(() => router.push('/api-keys'), 3000);
      return;
    }

    if (!code) {
        if (!user || !firestore) {
            setMessage('Waiting for user session...');
            return;
        }
        setError('Invalid request. No authorization code found.');
        setTimeout(() => router.push('/api-keys'), 3000);
        return;
    }

    if (user && firestore) {
      const handleTokenExchange = async () => {
        try {
          setMessage('Looking up your API credentials...');
          const socialMediaAccountsCollection = collection(
            firestore, 'users', user.uid, 'socialMediaAccounts'
          );
          const q = query(socialMediaAccountsCollection, where("platform", "==", "Instagram"));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            throw new Error("Could not find Instagram credentials. Please save your App ID and Secret in the API Keys page first.");
          }

          const accountData = querySnapshot.docs[0].data() as SocialMediaAccount;
          const accountIdToUpdate = querySnapshot.docs[0].id;
          
          if (!accountData.clientId || !accountData.clientSecret) {
            throw new Error("Client ID or Client Secret is missing from your saved credentials.");
          }
          
          setMessage('Exchanging authorization code for access token...');
          const { accessToken } = await getInstagramAccessToken({ 
              code, 
              clientId: accountData.clientId, 
              clientSecret: accountData.clientSecret 
          });
          
          if (!accessToken) {
            throw new Error('Failed to retrieve a valid access token.');
          }

          setMessage('Fetching your account details...');
          const { username, instagramId, facebookPageId, facebookPageName } = await getInstagramUserDetails({ accessToken });

          setMessage('Saving your connection...');
          const docRef = doc(firestore, `users/${user.uid}/socialMediaAccounts`, accountIdToUpdate);
          
          const updatedData: Partial<SocialMediaAccount> = {
            apiKey: accessToken, // This is the user access token
            connected: true,
            username: username, // Instagram username
            instagramId: instagramId,
            facebookPageId: facebookPageId,
            facebookPageName: facebookPageName,
            updatedAt: new Date().toISOString(),
          };

          await updateDoc(docRef, updatedData);

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

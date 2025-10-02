'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { SocialMediaAccount } from '@/lib/types';

// FAKE flow for now until real API is implemented
async function getInstagramTokens(code: string) {
  console.log('Exchanging code for token (simulated):', code);
  // In a real app, you would make a server-side call here to your backend to exchange the code for a token.
  // This backend service would use your App Secret.
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    accessToken: `fake-instagram-access-token-${Date.now()}`,
    userId: 'fake-user-id', // This would be the IG user ID
    username: 'YourInstagram' // This would be fetched from the API
  };
}


function InstagramCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Connecting to Instagram...');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const state = searchParams.get('state');

    if (errorParam) {
      setError(`Failed to connect to Instagram: ${errorParam}`);
      toast({
        variant: 'destructive',
        title: 'Instagram Connection Failed',
        description: 'The connection was denied or an error occurred.',
      });
      setTimeout(() => router.push('/api-keys'), 3000);
      return;
    }

    if (code && user && firestore && state === user.uid) {
      const handleTokenExchange = async () => {
        try {
          setMessage('Finalizing Instagram connection...');
          
          // In a real app, you'd exchange the code for a token via your backend/Genkit flow
          const { accessToken, username } = await getInstagramTokens(code);

          const socialMediaAccountsCollection = collection(
            firestore,
            'users',
            user.uid,
            'socialMediaAccounts'
          );
          
          const q = query(socialMediaAccountsCollection, where("platform", "==", "Instagram"));
          const querySnapshot = await getDocs(q);
          
          let accountIdToUpdate: string | null = null;
          if (!querySnapshot.empty) {
            accountIdToUpdate = querySnapshot.docs[0].id;
            setMessage('Found existing Instagram connection. Updating...');
          } else {
             setMessage('Creating new Instagram connection...');
          }

          const accountData: Omit<SocialMediaAccount, 'id' | 'createdAt'> & { createdAt?: string } = {
            userId: user.uid,
            platform: 'Instagram',
            username: username, 
            apiKey: accessToken,
            connected: true,
            updatedAt: new Date().toISOString(),
          };
          
          const batch = writeBatch(firestore);
          if (accountIdToUpdate) {
            const docRef = doc(firestore, `users/${user.uid}/socialMediaAccounts`, accountIdToUpdate);
            batch.update(docRef, accountData);
          } else {
            const newDocRef = doc(socialMediaAccountsCollection);
            accountData.createdAt = new Date().toISOString();
            batch.set(newDocRef, accountData as SocialMediaAccount);
          }
          await batch.commit();

          toast({
            title: 'Instagram Account Connected!',
            description: 'You can now manage this account.',
          });

          router.push('/connected-accounts');
        } catch (err: any) {
          console.error('Failed to exchange token or save account:', err);
          setError(err.message || 'An error occurred while finalizing the connection.');
          toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: 'Could not save your Instagram account connection. Please try again.',
          });
          setTimeout(() => router.push('/api-keys'), 3000);
        }
      };

      handleTokenExchange();
    } else if (!user || !firestore) {
      // Wait for user and firestore to be available
    } else if (state !== user?.uid) {
        setError('Invalid state parameter. This could be a security risk. Aborting.');
        setTimeout(() => router.push('/api-keys'), 3000);
    }
     else {
      setError('Invalid request. No authorization code found.');
      setTimeout(() => router.push('/api-keys'), 3000);
    }
  }, [searchParams, router, user, firestore, toast]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4 text-center">
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
          <p className="text-muted-foreground">Please wait while we finalize the connection.</p>
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

    
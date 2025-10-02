'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getInstagramAccessToken, getInstagramUserDetails } from '@/ai/flows/instagram-auth';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { SocialMediaAccount } from '@/lib/types';

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

    if (code && user && firestore) {
      const handleTokenExchange = async () => {
        try {
          setMessage('Exchanging authorization code for access token...');
          const { accessToken } = await getInstagramAccessToken({ code });
          
          if (!accessToken) {
            throw new Error('Failed to retrieve a valid access token.');
          }

          setMessage('Fetching user details from Instagram...');
          const { username, instagramId } = await getInstagramUserDetails({ accessToken });

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

          const accountData: Omit<SocialMediaAccount, 'id'> = {
            userId: user.uid,
            platform: 'Instagram',
            username: username,
            apiKey: accessToken,
            connected: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const batch = writeBatch(firestore);
          if (accountIdToUpdate) {
            const docRef = doc(firestore, `users/${user.uid}/socialMediaAccounts`, accountIdToUpdate);
            batch.update(docRef, accountData);
          } else {
            const newDocRef = doc(socialMediaAccountsCollection);
            batch.set(newDocRef, accountData);
          }

          await batch.commit();

          toast({
            title: 'Instagram Account Connected!',
            description: `Successfully connected as @${username}.`,
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

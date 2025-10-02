'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { type SocialMediaAccount } from '@/lib/types';

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
      setTimeout(() => router.push('/api-keys'), 3000);
      return;
    }

    if (code && user && firestore) {
      const handleTokenExchange = async () => {
        try {
          setMessage('Exchanging authorization code for tokens...');
          const { accessToken, refreshToken } = await getYoutubeTokens({ code });

          const socialMediaAccountsCollection = collection(
            firestore,
            'users',
            user.uid,
            'socialMediaAccounts'
          );

          // Check if a YouTube account already exists
          const q = query(socialMediaAccountsCollection, where("platform", "==", "YouTube"));
          const querySnapshot = await getDocs(q);
          
          const batch = writeBatch(firestore);
          
          if (!querySnapshot.empty) {
            const accountIdToUpdate = querySnapshot.docs[0].id;
            setMessage('Found existing YouTube connection. Updating...');
            const docRef = doc(firestore, `users/${user.uid}/socialMediaAccounts`, accountIdToUpdate);
            const accountData: Partial<SocialMediaAccount> = {
                apiKey: accessToken,
                refreshToken: refreshToken,
                connected: true,
                updatedAt: new Date().toISOString(),
            };
            batch.update(docRef, accountData);
          } else {
             setMessage('Creating new YouTube connection...');
             // A real app would make another API call to get the channel name.
             const newAccountData: SocialMediaAccount = {
                id: '', // Firestore will generate this
                userId: user.uid,
                platform: 'YouTube',
                username: 'YouTube Account', // Placeholder
                apiKey: accessToken,
                refreshToken: refreshToken,
                connected: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
             };
             const newDocRef = doc(socialMediaAccountsCollection);
             batch.set(newDocRef, newAccountData);
          }

          await batch.commit();

          toast({
            title: 'YouTube Account Connected!',
            description: 'You can now manage this account.',
          });

          router.push('/connected-accounts');
        } catch (err: any) {
          console.error('Failed to exchange token or save account:', err);
          setError(err.message || 'An error occurred while finalizing the connection.');
          toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: 'Could not save your YouTube account connection. Please try again.',
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

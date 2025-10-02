'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { SocialMediaAccount } from '@/lib/types';

function YouTubeCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          const { accessToken, refreshToken } = await getYoutubeTokens({ code });

          const socialMediaAccountsCollection = collection(
            firestore,
            'users',
            user.uid,
            'socialMediaAccounts'
          );

          // For this example, we'll use a placeholder username.
          // A real app would make another API call to get the channel name.
          const newAccount: Omit<SocialMediaAccount, 'id'> = {
            userId: user.uid,
            platform: 'YouTube',
            username: 'YouTube Account', // Placeholder
            apiKey: accessToken, // Store access token
            refreshToken: refreshToken, // Store refresh token
            connected: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await addDocumentNonBlocking(socialMediaAccountsCollection, newAccount);

          toast({
            title: 'YouTube Account Connected!',
            description: 'You can now manage this account.',
          });

          router.push('/connected-accounts');
        } catch (err) {
          console.error('Failed to exchange token or save account:', err);
          setError('An error occurred while finalizing the connection.');
          toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: 'Could not save your YouTube account connection. Please try again.',
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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
      {error ? (
        <>
          <h1 className="text-xl font-semibold text-destructive">Connection Failed</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting you back...</p>
        </>
      ) : (
        <>
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          <h1 className="text-xl font-semibold">Connecting to YouTube...</h1>
          <p className="text-muted-foreground">Please wait while we finalize the connection.</p>
        </>
      )}
    </div>
  );
}


export default function YouTubeCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <YouTubeCallback />
        </Suspense>
    )
}

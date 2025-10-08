'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function InstagramCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Here we are simply forwarding the query params to the API route.
    // This client-side page acts as a stable entry point for the OAuth redirect.
    if (code) {
      // The API route will handle the token exchange.
      // We pass the code and state to it.
      const apiRoute = `/api/instagram-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
      router.replace(apiRoute);
    } else if (error) {
      // If there's an error from Instagram, redirect back to the app with the error message.
      const errorMessage = searchParams.get('error_description') || 'Instagram connection was denied or failed.';
      router.replace(`/uploader_panel?view=api-keys&error=${encodeURIComponent(errorMessage)}`);
    } else {
        // Fallback for an invalid state
        router.replace(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request from Instagram.')}`);
    }
  }, [searchParams, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Please wait, connecting to Instagram...</p>
    </div>
  );
}

export default function InstagramCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InstagramCallback />
        </Suspense>
    )
}

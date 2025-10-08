'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function YouTubeCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (code) {
      // The API route will handle the token exchange.
      const apiRoute = `/api/youtube-callback?code=${encodeURIComponent(code)}`;
      router.replace(apiRoute);
    } else if (error) {
      // If there's an error from Google, redirect back with the error.
      router.replace(`/uploader_panel?view=api-keys&error=${encodeURIComponent('YouTube connection was denied or failed.')}`);
    } else {
       // Fallback for an invalid state
       router.replace(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request from YouTube.')}`);
    }
  }, [searchParams, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Please wait, connecting to YouTube...</p>
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

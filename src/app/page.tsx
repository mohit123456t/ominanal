'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { LoaderCircle } from 'lucide-react';

/**
 * This is the root page of the application and acts as a redirection hub.
 * After a user logs in, they are sent here. This component then fetches
 * the user's role from Firestore and redirects them to the correct panel.
 */
export default function RedirectionHubPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Memoize the document reference to prevent re-renders
  const userDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  // Fetch the user's profile from Firestore
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    // If auth is still loading, wait.
    if (isUserLoading || isProfileLoading) {
      return;
    }
    
    // If there is no user, redirect to the landing page.
    if (!user) {
      router.replace('/landing');
      return;
    }

    // If we have the user's profile, redirect based on role.
    if (userProfile && userProfile.role) {
      switch (userProfile.role) {
        case 'superadmin':
          router.replace('/superadmin_panal');
          break;
        case 'admin':
          router.replace('/admin_panel');
          break;
        case 'brand':
          router.replace('/brand_panel');
          break;
        case 'uploader':
           router.replace('/uploader_panel');
          break;
        case 'video_editor':
          router.replace('/video_editor_panel');
          break;
        case 'script_writer':
          router.replace('/script_writer_panel');
          break;
        case 'thumbnail_maker':
          router.replace('/thumbnail_maker_panel');
          break;
        default:
          // Fallback for unknown roles or users without a specific panel
          router.replace('/uploader_panel');
          break;
      }
    } else if (!isProfileLoading && user && !userProfile) {
        // If the user is logged in but has no profile, it might be a new user
        // or an error state. For now, redirect to a default panel.
         console.warn("User is logged in but no profile found. Redirecting to default panel.");
         router.replace('/uploader_panel');
    }

  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  // Display a loading indicator while we figure out where to go.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-background p-4">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Authenticating and redirecting...</p>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useUser, useFirestore } from '@/firebase';
import { LoaderCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';


const unauthenticatedRoutes = ['/login', '/signup', '/instagram-callback', '/youtube-callback'];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  useEffect(() => {
    if (isUserLoading || !firestore) {
      return; // Wait until user state and firestore are initialized
    }
    
    if (!user && !unauthenticatedRoutes.includes(pathname)) {
      router.push('/login');
      return;
    }
    
    if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(userDocSnap => {
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const role = userData.role;
                // If user with a specific role tries to access the main app, redirect them
                if (role && role !== 'user' && !pathname.startsWith(`/${role}_panel`)) {
                     switch (role) {
                        case 'admin':
                            router.push('/admin_panel');
                            break;
                        case 'superadmin':
                            router.push('/superadmin_panal');
                            break;
                        case 'video_editor':
                            router.push('/video_editor_panel');
                            break;
                        case 'script_writer':
                            router.push('/script_writer_panel');
                            break;
                        case 'thumbnail_maker':
                            router.push('/thumbnail_maker_panel');
                            break;
                        case 'uploader':
                             router.push('/uploader_panel');
                            break;
                        case 'brand':
                             router.push('/brand_panel');
                            break;
                        default:
                            // stay in the main app layout if role is user or not defined
                            break;
                    }
                }
            }
        });
    }

  }, [user, isUserLoading, router, pathname, firestore]);
  
  if (unauthenticatedRoutes.includes(pathname)) {
    return <>{children}</>;
  }


  if (isUserLoading || (!user && !unauthenticatedRoutes.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

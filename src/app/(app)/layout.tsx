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
const panelRoutes = [
    '/admin_panel', '/superadmin_panel', '/brand_panel',
    '/video_editor_panel', '/script_writer_panel',
    '/thumbnail_maker_panel', '/uploader_panel'
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }
    
    // If user is not logged in and not on an allowed unauthenticated route, redirect to login
    if (!user) {
        if (!unauthenticatedRoutes.includes(pathname)) {
            router.push('/login');
        }
        return;
    }

    // If user is logged in, check their role and redirect if necessary
    if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(userDocSnap => {
            if (userDocSnap.exists()) {
                const role = userDocSnap.data().role;
                const targetPath = `/${role}_panel`;
                
                // If the user is on a generic page but should be on a specific panel, redirect them.
                if (panelRoutes.includes(targetPath) && !pathname.startsWith(targetPath)) {
                   router.push(targetPath);
                }
            } else {
                 // Default redirection if user doc doesn't exist but they are authenticated
                if (!pathname.startsWith('/dashboard')) {
                   // router.push('/dashboard');
                }
            }
        });
    }

  }, [user, isUserLoading, router, pathname, firestore]);
  
  // If the route is one of the panels or an auth page, render it directly without the main app layout
  if (unauthenticatedRoutes.includes(pathname) || panelRoutes.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }


  if (isUserLoading || (!user && !unauthenticatedRoutes.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // For authenticated users on main app routes, show the standard layout
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

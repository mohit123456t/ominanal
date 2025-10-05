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
      return; // Wait until user state is initialized
    }
    
    // If user is not logged in and not on an allowed unauthenticated route, redirect to login
    if (!user && !unauthenticatedRoutes.includes(pathname)) {
      router.push('/login');
      return;
    }
    
    // If the user is logged in, check their role and redirect if necessary
    if (user && firestore) {
        // If they are on the login/signup page, they shouldn't be. Redirect them.
        if (pathname === '/login' || pathname === '/signup') {
             router.push('/dashboard'); // Will be immediately re-evaluated for role
             return;
        }

        // The main redirection logic. Fetch role and redirect to the correct panel.
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(userDocSnap => {
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const role = userData.role;
                const targetPath = `/${role}_panel`;
                 
                 // Redirect to panel if role exists and user is not already on their panel page
                if (role && panelRoutes.includes(targetPath) && pathname !== targetPath) {
                    router.push(targetPath);
                }
            } else {
                 // If no user doc, but they are logged in, just let them access standard dashboard
            }
        }).catch(err => {
            console.error("Error fetching user role for redirection:", err);
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

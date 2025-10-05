'use client';

import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { useUser } from '@/firebase';
import { LoaderCircle } from 'lucide-react';

const unauthenticatedRoutes = ['/login', '/signup', '/forgot-password', '/instagram-callback', '/youtube-callback'];
const panelRoutes = [
    '/admin_panel', '/superadmin_panal', '/brand_panel',
    '/video_editor_panel', '/script_writer_panel',
    '/thumbnail_maker_panel', '/uploader_panel'
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // If the route is one of the panels or an auth page, render it directly without the main app layout
  if (unauthenticatedRoutes.includes(pathname) || panelRoutes.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Show a loading spinner while checking auth state for main app routes
  if (isUserLoading || (!user && !unauthenticatedRoutes.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated and not on an allowed route, this will be caught by the loader condition,
  // but a push to login can be a fallback (though login page handles redirection mostly)
  if (!user && !unauthenticatedRoutes.includes(pathname)) {
      router.push('/login');
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          </div>
      );
  }

  // For authenticated users on main app routes, show the standard layout
  return (
    <div>
        <AppHeader />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}

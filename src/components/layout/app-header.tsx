'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/layout/user-nav';

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/settings')) {
    const section = pathname.split('/')[2];
    switch (section) {
      case 'team':
        return 'Team Settings';
      default:
        return 'Settings';
    }
  }
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/analytics':
      return 'Advanced Analytics';
    case '/create-post':
      return 'Create Post';
    case '/posts':
      return 'Recent Posts';
    case '/campaign-ideas':
      return 'AI Campaign Ideas';
    case '/connected-accounts':
      return 'Connected Accounts';
    case '/pricing':
      return 'Subscription Plans';
    case '/api-keys':
      return 'API Keys';
    default:
      return 'OmniPost AI';
  }
};

export function AppHeader() {
  const pathname = usePathname();
  const title = useMemo(() => getPageTitle(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-headline font-semibold text-foreground">
          {title}
        </h1>
      </div>
      <UserNav />
    </header>
  );
}

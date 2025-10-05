'use client';

import { AppHeader } from '@/components/layout/app-header';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AppHeader />
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}

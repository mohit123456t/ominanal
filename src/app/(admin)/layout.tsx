'use client';

// This layout provides a completely separate, full-screen view for the admin section,
// without the standard application sidebar or header.
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just render the children, which will be the admin pages.
  return <>{children}</>;
}

'use client';

// This layout provides a completely separate, full-screen view for the superadmin section,
// without the standard application sidebar or header.
export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just render the children, which will be the superadmin pages.
  return <>{children}</>;
}

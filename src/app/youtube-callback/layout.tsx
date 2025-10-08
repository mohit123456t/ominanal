'use client';

// This layout provides a completely separate, full-screen view for the callback page.
export default function CallbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just render the children, which will be the callback page.
  return <>{children}</>;
}

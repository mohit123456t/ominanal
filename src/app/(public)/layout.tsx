'use client';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout applies the frosted glass background theme to all public pages.
  return <>{children}</>;
}

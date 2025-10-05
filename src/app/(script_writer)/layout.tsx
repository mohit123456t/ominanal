'use client';

// This layout provides a completely separate, full-screen view for the script writer section,
// without the standard application sidebar or header.
export default function ScriptWriterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just render the children, which will be the script writer pages.
  return <>{children}</>;
}

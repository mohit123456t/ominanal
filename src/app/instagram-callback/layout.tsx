'use client';

// This layout ensures that the callback page takes up the full screen
// without any of the main app's navigational elements.
export default function InstagramCallbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

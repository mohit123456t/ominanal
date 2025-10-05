'use client';

// This layout provides a completely separate, full-screen view for the video editor section,
// without the standard application sidebar or header.
export default function VideoEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just render the children, which will be the video editor pages.
  return <>{children}</>;
}

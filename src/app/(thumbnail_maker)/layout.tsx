'use client';

// This layout provides a completely separate, full-screen view for the thumbnail maker section,
// without the standard application sidebar or header.
export default function ThumbnailMakerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just render the children, which will be the thumbnail maker pages.
  return <>{children}</>;
}

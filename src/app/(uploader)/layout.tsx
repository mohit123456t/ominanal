'use client';

// This layout provides a completely separate, full-screen view for the uploader section,
// without the standard application sidebar or header.
export default function UploaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just render the children, which will be the uploader pages.
  return <>{children}</>;
}

'use client';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout applies the frosted glass background theme to all public pages.
  return <div className="min-h-screen bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent">{children}</div>;
}
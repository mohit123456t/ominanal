'use client';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout is intentionally simple.
  // The landing page (`/`) will implement its own header/footer.
  // The auth pages (`/login`, `/signup`, etc.) will be centered via their own page styles.
  return <>{children}</>;
}

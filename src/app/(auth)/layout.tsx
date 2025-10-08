'use client';

// This layout provides a clean, centered view for authentication pages
// without the standard application header or footer.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
      <main>{children}</main>
    </div>
  );
}

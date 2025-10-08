'use client';

// This layout provides a clean, centered view for authentication pages
// with a new, modern background design.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-slate-200 overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
      
      <main className="z-10 w-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}

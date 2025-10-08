'use client';

// This layout provides a clean, centered view for authentication pages
// with a new, modern background design.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-slate-900 overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse delay-2000"></div>
      
      <main className="z-10 w-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}

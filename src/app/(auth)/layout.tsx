'use client';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent overflow-hidden p-4">
      <main className="z-10 w-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}

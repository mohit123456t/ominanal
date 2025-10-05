'use client';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}

'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Logo = () => (
    <div className="flex items-center gap-2">
        <svg
            className="size-8 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            fill="currentColor"
            />
        </svg>
        <h2 className="font-bold text-lg text-foreground">TrendXoda</h2>
    </div>
);


export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent text-foreground">
        <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-xl border-b border-slate-300/70">
            <div className="container mx-auto h-20 flex items-center justify-between px-6">
                 <Link href="/">
                    <Logo />
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
                    <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                    <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                    <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                       <Link href="/login">Login</Link>
                    </Button>
                     <Button asChild>
                       <Link href="/signup">Get Started</Link>
                    </Button>
                </div>
            </div>
        </header>
        <main className="flex-grow">
            {children}
        </main>
         <footer className="bg-slate-200/50 border-t border-slate-300/50">
            <div className="container mx-auto py-6 px-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} TrendXoda. All Rights Reserved.
            </div>
        </footer>
    </div>
  );
}

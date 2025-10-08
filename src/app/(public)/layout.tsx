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
            fill="hsl(var(--accent))"
            />
            <path
            d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5Z"
            stroke="hsl(var(--background))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
            <path
            d="M12 2V22"
            stroke="hsl(var(--background))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
        </svg>
        <h2 className="font-bold text-lg text-foreground">OmniPost AI</h2>
    </div>
);


export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto h-16 flex items-center justify-between px-4">
                 <Link href="/">
                    <Logo />
                </Link>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                       <Link href="/login">Login</Link>
                    </Button>
                     <Button variant="secondary" asChild>
                       <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </header>
        <main className="flex-grow">
            {children}
        </main>
         <footer className="bg-background border-t border-border">
            <div className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} OmniPost AI. All Rights Reserved.
            </div>
        </footer>
    </div>
  );
}

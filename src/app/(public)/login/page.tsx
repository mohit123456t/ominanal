'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center justify-center gap-2 mb-8">
    <svg
      className="size-10 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
        fill="currentColor"
      />
    </svg>
    <h2 className="font-bold text-2xl text-slate-800">TrendXoda</h2>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Initialization Error',
        description: 'Services are not ready. Please try again.',
      });
      return;
    }
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both email and password.',
      });
      return;
    }
    
    setIsLoading(true);
    
    // Initiate non-blocking sign-in
    initiateEmailSignIn(auth, email, password);
    
    // Redirect immediately to the central hub. The onAuthStateChanged listener
    // in the provider will handle the user session and redirect if login fails.
    router.push('/');
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent overflow-hidden p-4">
      <main className="z-10 w-full flex items-center justify-center">
        <div
          className="relative w-full max-w-md mx-auto bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-300/70 overflow-hidden"
        >
          <div className="p-8 md:p-10 flex flex-col justify-center relative z-10">
            <div>
              <Logo />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 text-center">Login to your account</h1>
              <p className="text-slate-500 mt-2 text-sm text-center">Welcome back! Please enter your details.</p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-700">Email</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">Forgot Password?</Link>
                </div>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
              </div>
              <Button onClick={handleLogin} className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <LogIn className="mr-2" />}
                Login
              </Button>
            </div>
            <p className="text-center text-sm text-slate-500 mt-8">
              Are you a new brand?{' '}
              <Link href="/signup" className="underline underline-offset-4 font-semibold text-primary hover:text-primary/80">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

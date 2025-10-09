'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Mail } from 'lucide-react';

const Logo = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
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
    <h2 className="font-bold text-xl text-foreground">TrendXoda</h2>
  </div>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Initialization Error',
        description: 'Services are not ready. Please try again.',
      });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast({
        title: 'Success!',
        description:
          'If an account exists for that email, a password reset link has been sent.',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Success!',
        description:
          'If an account exists for that email, a password reset link has been sent.',
      });
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl border p-8">
        <Logo />
        <h1 className="text-xl font-bold text-foreground">
            Reset Password
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
            Enter your email to receive a password reset link.
        </p>

        <div className="mt-8 space-y-6">
        {!isSent ? (
            <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
                id="reset-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
            />
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground p-4 bg-primary/10 rounded-md">
            <p>
                A reset link has been sent to your email address if an
                account exists. Please check your inbox (and spam folder).
            </p>
            </div>
        )}
        {!isSent && (
            <Button
            onClick={handlePasswordReset}
            className="w-full"
            size="lg"
            disabled={isLoading || !email}
            >
            {isLoading ? (
                <LoaderCircle className="animate-spin mr-2" />
            ) : (
                <Mail className="mr-2" />
            )}
            Send Reset Link
            </Button>
        )}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
        Remember your password?{' '}
        <Link
            href="/login"
            className="underline underline-offset-4 font-semibold text-primary hover:text-primary/80"
        >
            Log In
        </Link>
        </p>
    </div>
  );
}

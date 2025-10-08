'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Mail } from 'lucide-react';

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
      // We show a generic message to prevent email enumeration
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
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <p>A reset link has been sent to your email address if an account exists. Please check your inbox (and spam folder).</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            {!isSent && (
                 <Button onClick={handlePasswordReset} className="w-full" disabled={isLoading || !email}>
                    {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Mail className="mr-2"/>}
                    Send Reset Link
                </Button>
            )}
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

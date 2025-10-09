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
import { motion } from 'framer-motion';

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
     <motion.div 
      className="w-full max-w-4xl mx-auto bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-300/70 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="grid md:grid-cols-2">
         <div className="p-8 md:p-12 flex flex-col justify-center">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
            <Logo />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
            <h1 className="text-2xl font-bold text-slate-800">
                Reset Password
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
                Enter your email to receive a password reset link.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="mt-8 space-y-6">
            {!isSent ? (
                <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-slate-700">Email</Label>
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
                <div className="text-center text-sm text-slate-600 p-4 bg-primary/10 rounded-md border border-primary/20">
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
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} className="text-center text-sm text-slate-500 mt-8">
            Remember your password?{' '}
            <Link
                href="/login"
                className="underline underline-offset-4 font-semibold text-primary hover:text-primary/80"
            >
                Log In
            </Link>
          </motion.p>
        </div>
         <div className="hidden md:block">
          <Image 
            src="https://picsum.photos/seed/abstract-art/800/1000"
            alt="Forgot password decorative image"
            width={800}
            height={1000}
            className="w-full h-full object-cover"
            data-ai-hint="abstract light shapes"
          />
        </div>
      </div>
    </motion.div>
  );
}

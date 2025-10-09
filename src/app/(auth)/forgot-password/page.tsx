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

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const Logo = () => (
  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
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
  </motion.div>
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-300/10 overflow-hidden"
    >
      <div className="grid md:grid-cols-2">
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <Logo />
          <motion.h1
            variants={itemVariants}
            className="text-2xl font-bold text-foreground mt-4"
          >
            Reset Password
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-slate-400 mt-2 text-sm"
          >
            Enter your email to receive a password reset link.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 space-y-6">
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
              <div className="text-center text-sm text-slate-300 p-4 bg-primary/10 rounded-md">
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
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-slate-400 mt-8"
          >
            Remember your password?{' '}
            <Link
              href="/login"
              className="underline underline-offset-4 font-semibold text-primary hover:text-primary/80"
            >
              Log In
            </Link>
          </motion.p>
        </div>
        <motion.div
          variants={itemVariants}
          className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-8"
        >
          <Image
            src="https://picsum.photos/seed/forgot/600/450"
            alt="Forgot password illustration"
            width={600}
            height={450}
            className="rounded-xl shadow-2xl"
            data-ai-hint="security lock illustration"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

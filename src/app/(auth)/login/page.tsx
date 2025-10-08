'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirebase } from '@/firebase';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';


const Logo = () => (
    <div className="flex items-center gap-2 mb-4">
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


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const handleLogin = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Initialization Error',
        description: 'Services are not ready. Please try again.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      toast({
        title: 'Successfully logged in!',
        description: 'Checking your role...',
      });
      
      const userDocRef = doc(firestore, 'users', loggedInUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (loggedInUser.email === 'mohitmleena3@gmail.com') {
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: loggedInUser.uid,
            email: loggedInUser.email,
            name: loggedInUser.displayName || 'Super Admin',
            role: 'superadmin',
            createdAt: new Date().toISOString(),
          }, { merge: true });
        }
        window.location.href = '/superadmin_panal';
        return;
      }
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;

        let targetUrl = '';

        switch (role) {
          case 'admin': targetUrl = '/admin_panel'; break;
          case 'brand': targetUrl = '/brand_panel'; break;
          case 'video_editor': targetUrl = '/video_editor_panel'; break;
          case 'script_writer': targetUrl = '/script_writer_panel'; break;
          case 'thumbnail_maker': targetUrl = '/thumbnail_maker_panel'; break;
          case 'uploader': targetUrl = '/uploader_panel'; break;
          default:
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: "Your user role is not recognized or is missing. Please contact support.",
            });
            setIsLoading(false);
            return;
        }
        
        window.location.href = targetUrl;

      } else {
         toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: "Could not find user details in the database. Please contact support if you believe this is an error.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = 'Invalid email or password. Please try again.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: description,
      });
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-300/70 overflow-hidden">
        <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
                <Logo />
                <h1 className="text-2xl font-bold text-foreground mt-4">Login to your account</h1>
                <p className="text-slate-500 mt-2 text-sm">Welcome back! Please enter your details.</p>

                <div className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-primary hover:underline underline-offset-4"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    </div>
                     <Button onClick={handleLogin} className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <LogIn className="mr-2"/>}
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
             <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-8">
                 <Image
                    src="https://picsum.photos/seed/login/600/450"
                    alt="Login illustration"
                    width={600}
                    height={450}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="digital illustration productivity"
                />
            </div>
        </div>
    </div>
  );
}

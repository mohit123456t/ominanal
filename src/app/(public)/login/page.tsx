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
import { useAuth, useFirebase } from '@/firebase';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';

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

      // Handle Super Admin separately and first
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
          case 'admin':
            targetUrl = '/admin_panel';
            break;
          case 'brand':
            targetUrl = '/brand_panel';
            break;
          case 'video_editor':
            targetUrl = '/video_editor_panel';
            break;
          case 'script_writer':
            targetUrl = '/script_writer_panel';
            break;
          case 'thumbnail_maker':
            targetUrl = '/thumbnail_maker_panel';
            break;
          case 'uploader':
            targetUrl = '/uploader_panel';
            break;
          default:
            // This handles cases where role is missing or not recognized
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: "Your user role is not recognized or is missing. Please contact support.",
            });
            setIsLoading(false);
            return; // Stop execution
        }
        
        // If a valid role was found, redirect
        window.location.href = targetUrl;

      } else {
         // This case handles users who might exist in Auth but not in the 'users' collection
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
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Client & Staff Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
             {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <LogIn className="mr-2"/>}
            Login
          </Button>
           <p className="text-center text-sm text-muted-foreground">
            Are you a new brand?{' '}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

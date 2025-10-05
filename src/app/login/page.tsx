'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();
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

      // Check for user role in the 'users' collection first
      const userDocRef = doc(firestore, 'users', loggedInUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let role = 'user'; // default role

      if (userDocSnap.exists()) {
        role = userDocSnap.data().role || 'user';
      } else {
        // If no user doc, check if they are an admin in the dedicated admin roles collection
        const adminDocRef = doc(firestore, 'roles_admin', loggedInUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
            role = 'superadmin';
        }
      }


      toast({
        title: 'Successfully logged in!',
        description: `Redirecting you to your panel...`,
      });

      switch (role) {
        case 'superadmin':
          router.push('/superadmin_panal');
          break;
        case 'admin':
          router.push('/admin_panel');
          break;
        case 'brand':
          router.push('/brand_panel');
          break;
        case 'video_editor':
          router.push('/video_editor_panel');
          break;
        case 'script_writer':
          router.push('/script_writer_panel');
          break;
        case 'thumbnail_maker':
            router.push('/thumbnail_maker_panel');
            break;
        case 'uploader':
            router.push('/uploader_panel');
            break;
        default:
          router.push('/login'); 
          break;
      }

    } catch (error: any) {
      console.error(error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential') {
        description = 'Invalid email or password. Please try again.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
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
              <path
                d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 2V22"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
        <h1 className="font-headline text-3xl font-bold">OmniPost AI</h1>
      </div>
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

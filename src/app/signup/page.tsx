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
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, UserPlus } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSignup = async () => {
    if (!auth || !firestore) return;
    if (password.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Weak Password',
            description: 'Password should be at least 6 characters.',
        });
        return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(newUser, { displayName: name });

      // Create user document in Firestore
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        uid: newUser.uid,
        name: name,
        email: email,
        brandName: brandName,
        mobileNumber: mobileNumber,
        role: 'brand', // Assign the brand role
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Account Created!',
        description: "You've been successfully signed up. Redirecting to your Brand Panel...",
      });
      
      // Explicitly redirect to brand_panel after successful signup
      router.push('/brand_panel');

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Signup Error',
        description: error.message,
      });
      setIsLoading(false); // Only set loading to false on error
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create Brand Account</CardTitle>
          <CardDescription>
            Join our platform to manage your campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="signup-name">Your Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="signup-brand-name">Brand Name</Label>
            <Input
              id="signup-brand-name"
              type="text"
              placeholder="My Awesome Brand"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-mobile">Mobile Number</Label>
            <Input
              id="signup-mobile"
              type="tel"
              placeholder="Your mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleSignup} className="w-full" disabled={isLoading}>
             {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <UserPlus className="mr-2"/>}
            Create Account
          </Button>
           <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

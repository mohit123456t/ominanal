'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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

      await updateProfile(newUser, { displayName: name });

      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        uid: newUser.uid,
        name: name,
        email: email,
        brandName: brandName,
        mobileNumber: mobileNumber,
        role: 'brand',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Account Created!',
        description: "You've been successfully signed up. Redirecting to your Brand Panel...",
      });
      
      router.push('/brand_panel');

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Signup Error',
        description: error.message,
      });
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
                <motion.h1 variants={itemVariants} className="text-2xl font-bold text-foreground mt-4">Create your Brand Account</motion.h1>
                <motion.p variants={itemVariants} className="text-slate-400 mt-2 text-sm">Join us to boost your social media presence.</motion.p>

                <motion.div variants={itemVariants} className="mt-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="signup-name">Your Name</Label>
                        <Input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="signup-brand-name">Brand Name</Label>
                        <Input id="signup-brand-name" type="text" placeholder="My Brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} disabled={isLoading} required />
                    </div>
                  </div>
                   <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signup-mobile">Mobile Number</Label>
                        <Input id="signup-mobile" type="tel" placeholder="Your mobile number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} disabled={isLoading} required />
                    </div>
                    
                     <Button onClick={handleSignup} className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <UserPlus className="mr-2"/>}
                        Create Account
                    </Button>
                </motion.div>
                 <motion.p variants={itemVariants} className="text-center text-sm text-slate-400 mt-8">
                    Already have an account?{' '}
                    <Link href="/login" className="underline underline-offset-4 font-semibold text-primary hover:text-primary/80">
                        Log In
                    </Link>
                </motion.p>
            </div>
             <motion.div variants={itemVariants} className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-8">
                 <Image
                    src="https://picsum.photos/seed/signup/600/450"
                    alt="Signup illustration"
                    width={600}
                    height={450}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="team collaboration illustration"
                />
            </motion.div>
        </div>
    </motion.div>
  );
}

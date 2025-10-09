'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { motion, useMotionValue } from 'framer-motion';

const Logo = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
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

export default function SignupPage() {
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // ✨ शिमर को दिखाने/छिपाने के लिए
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  // ✨ शिमर इफ़ेक्ट के लिए माउस की पोजीशन ट्रैक करेंगे
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

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
     <div className="relative flex flex-col min-h-screen items-center justify-center bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent overflow-hidden p-4">
        <main className="z-10 w-full flex items-center justify-center">
            <motion.div 
              // ✨ शिमर इफ़ेक्ट के लिए कंटेनर को relative और overflow-hidden बनाया गया है
              className="relative w-full max-w-md mx-auto bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-300/70 overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* ✨ यह नया शिमर (चमक) वाला div है */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
                style={{
                    x: mouseX,
                    y: mouseY,
                    background: 'radial-gradient(300px circle at center, rgba(255, 255, 255, 0.4), transparent 80%)',
                }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                }}
              />

              <div className="p-8 md:p-10 flex flex-col justify-center relative z-10">
                  <Logo />
                  <h1 className="text-2xl font-bold text-center text-slate-800">Create your Brand Account</h1>
                  <p className="text-slate-500 mt-2 text-sm text-center">Join us to boost your social media presence.</p>

                  <div className="mt-8 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="signup-name" className="text-slate-700">Your Name</Label>
                              <Input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} required />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="signup-brand-name" className="text-slate-700">Brand Name</Label>
                              <Input id="signup-brand-name" type="text" placeholder="My Brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} disabled={isLoading} required />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-slate-700">Email</Label>
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
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-6">
                      Already have an account?{' '}
                      <Link href="/login" className="underline underline-offset-4 font-semibold text-primary hover:text-primary/80">
                          Log In
                      </Link>
                  </p>
              </div>
            </motion.div>
        </main>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ✨ बेहतर नेविगेशन के लिए इम्पोर्ट किया गया
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirebase, initiateEmailSignIn } from '@/firebase'; // ✨ Non-blocking sign-in
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';
import { motion, useMotionValue } from 'framer-motion'; // ✨ useMotionValue इम्पोर्ट किया गया

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // ✨ शिमर के लिए
  const auth = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter(); // ✨ useRouter हुक का इस्तेमाल
  const { toast } = useToast();

  // ✨ शिमर इफ़ेक्ट के लिए माउस की पोजीशन
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const handleLogin = () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Initialization Error',
        description: 'Services are not ready. Please try again.',
      });
      return;
    }
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both email and password.',
      });
      return;
    }
    
    setIsLoading(true);
    
    // Initiate non-blocking sign-in
    initiateEmailSignIn(auth, email, password);
    
    // Redirect immediately. The onAuthStateChanged listener in the provider
    // will handle the user session and redirect if login fails.
    router.push('/uploader_panel');
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent overflow-hidden p-4">
      <main className="z-10 w-full flex items-center justify-center">
        <motion.div
          // ✨ कार्ड को छोटा और शिमर के लिए तैयार किया गया
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
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* ✨ ग्रिड लेआउट हटा दिया गया, अब सिर्फ फॉर्म है */}
          <div className="p-8 md:p-10 flex flex-col justify-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
              <Logo />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
              <h1 className="text-2xl font-bold text-slate-800 text-center">Login to your account</h1>
              <p className="text-slate-500 mt-2 text-sm text-center">Welcome back! Please enter your details.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-700">Email</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">Forgot Password?</Link>
                </div>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
              </div>
              <Button onClick={handleLogin} className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <LogIn className="mr-2" />}
                Login
              </Button>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} className="text-center text-sm text-slate-500 mt-8">
              Are you a new brand?{' '}
              <Link href="/signup" className="underline underline-offset-4 font-semibold text-primary hover:text-primary/80">
                Sign Up
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
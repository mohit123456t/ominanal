'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BarChart, Clock, Search, Mail, Layers, Trophy, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { InfiniteScroll } from '@/components/layout/infinite-scroll';

// Reusable Animation Variants for a cleaner and more consistent feel
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // This will make children animate one by one
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    },
};

const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    show: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    },
};

const slideInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    show: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    },
};


const PublicHeader = () => (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-xl border-b border-slate-300/70">
        <div className="container mx-auto h-20 flex items-center justify-between px-6">
             <Link href="/landing">
                <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
                <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                   <Link href="/login">Login</Link>
                </Button>
                 <Button asChild>
                   <Link href="/signup">Get Started</Link>
                </Button>
            </div>
        </div>
    </header>
);

const PublicFooter = () => (
    <footer className="bg-slate-200/50 border-t border-slate-300/50">
        <div className="container mx-auto py-6 px-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TrendXoda. All Rights Reserved.
        </div>
    </footer>
);


const Logo = () => (
    <div className="flex items-center gap-2">
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
        <h2 className="font-bold text-lg text-foreground">TrendXoda</h2>
    </div>
);

// StatCard component now uses framer-motion directly with variants
const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
    <motion.div 
        variants={itemVariants} 
        className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-300/70 flex flex-col items-center text-center"
    >
        <div className="text-primary mb-3">{icon}</div>
        <div className="text-4xl font-bold text-foreground">{value}</div>
        <div className="text-muted-foreground text-sm mt-1">{label}</div>
    </motion.div>
);

const socialIcons = [
    { icon: <Instagram />, name: 'Instagram' },
    { icon: <Facebook />, name: 'Facebook' },
    { icon: <Youtube />, name: 'YouTube' },
    { icon: <Twitter />, name: 'Twitter / X' },
];

export default function LandingPage() {
  return (
     <div className="flex flex-col min-h-screen text-foreground bg-slate-50">
        <PublicHeader />
        <main className="flex-grow">
            <div className="w-full font-sans text-foreground overflow-x-hidden">
                {/* Hero Section */}
                <div className="container mx-auto px-6 py-20 md:py-28">
                   <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                           initial={{ opacity: 0, x: -30 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight text-foreground">
                               Automate The Manual, Achieve The Results.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                                TrendXoda is your all-in-one platform to create, schedule, and analyze your social media, freeing you to focus on growth.
                            </p>
                            <div className="mt-8">
                                <Button size="lg" asChild className="shadow-lg hover:shadow-primary/20 transition-shadow">
                                    <Link href="/signup">
                                        Get Started For Free <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                         <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                         >
                            <Image 
                                src="https://picsum.photos/seed/hero/800/600" 
                                alt="Dashboard preview" 
                                width={800} 
                                height={600}
                                className="rounded-2xl shadow-2xl border border-slate-300/70"
                                data-ai-hint="dashboard preview"
                            />
                        </motion.div>
                   </div>
                </div>

                <section className="py-12">
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                     >
                        <h3 className="text-center text-muted-foreground font-semibold uppercase tracking-wider mb-8">Powering Content Across All Major Platforms</h3>
                     </motion.div>
                    <div className="relative">
                        <div
                            className="absolute inset-0 z-10"
                            style={{
                                background:
                                'linear-gradient(to right, hsl(var(--background)), transparent 20%, transparent 80%, hsl(var(--background)))',
                            }}
                        />
                         <InfiniteScroll className="flex items-center gap-12 md:gap-20">
                            {socialIcons.map((item) => (
                                <div key={item.name} className="flex items-center gap-3 text-muted-foreground text-2xl">
                                    {item.icon}
                                    <span className="text-lg font-medium hidden sm:block">{item.name}</span>
                                </div>
                            ))}
                        </InfiniteScroll>
                    </div>
                </section>
                
                {/* Stats Section with Staggered Animation */}
                <div className="py-10 md:py-16">
                    <div className="container mx-auto px-6">
                        <motion.div 
                            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <StatCard icon={<Bot size={32}/>} value="10x" label="Faster Content Creation" />
                            <StatCard icon={<Clock size={32}/>} value="20+" label="Hours Saved Weekly" />
                            <StatCard icon={<BarChart size={32}/>} value="300%" label="Engagement Boost" />
                            <StatCard icon={<Layers size={32}/>} value="All" label="Platforms in One" />
                        </motion.div>
                    </div>
                </div>

                {/* How it works Section */}
                <div id="features" className="py-20 md:py-28">
                    <div className="container mx-auto px-4">
                        <motion.div 
                            className="text-center mb-16"
                            variants={itemVariants}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold">How TrendXoda Works</h2>
                            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Transform your social media strategy in three simple, powerful steps.</p>
                        </motion.div>

                        <motion.div 
                            className="grid grid-cols-1 gap-12"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            {/* Step 1 */}
                             <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-8 bg-white/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-300/70">
                                <motion.div variants={slideInLeft} className="md:w-1/2 w-full">
                                    <Image src="https://picsum.photos/seed/step1/600/400" alt="Create with AI" width={600} height={400} className="rounded-2xl shadow-lg w-full" data-ai-hint="AI creation interface"/>
                                </motion.div>
                                <motion.div variants={slideInRight} className="md:w-1/2 text-center md:text-left">
                                    <h3 className="text-2xl font-bold mb-2">1. Create with AI</h3>
                                    <p className="text-muted-foreground">Generate viral-worthy captions, scripts, and campaign ideas in seconds. Our AI is your new creative partner, always ready with fresh ideas.</p>
                                </motion.div>
                            </motion.div>
                             {/* Step 2 */}
                              <motion.div variants={itemVariants} className="flex flex-col-reverse md:flex-row items-center gap-8 bg-white/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-300/70">
                                <motion.div variants={slideInLeft} className="md:w-1/2 text-center md:text-left">
                                    <h3 className="text-2xl font-bold mb-2">2. Schedule with Ease</h3>
                                    <p className="text-muted-foreground">Plan your content calendar visually. Let our AI determine the optimal posting times to maximize reach and engagement, automatically.</p>
                                </motion.div>
                                 <motion.div variants={slideInRight} className="md:w-1/2 w-full">
                                    <Image src="https://picsum.photos/seed/step2/600/400" alt="Schedule content" width={600} height={400} className="rounded-2xl shadow-lg w-full" data-ai-hint="content calendar schedule"/>
                                 </motion.div>
                            </motion.div>
                             {/* Step 3 */}
                              <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-8 bg-white/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-300/70">
                                <motion.div variants={slideInLeft} className="md:w-1/2 w-full">
                                    <Image src="https://picsum.photos/seed/step3/600/400" alt="Track Performance" width={600} height={400} className="rounded-2xl shadow-lg w-full" data-ai-hint="analytics dashboard charts"/>
                                </motion.div>
                                <motion.div variants={slideInRight} className="md:w-1/2 text-center md:text-left">
                                    <h3 className="text-2xl font-bold mb-2">3. Track Performance</h3>
                                    <p className="text-muted-foreground">Gain deep insights with our beautiful and intuitive analytics. Understand what's working and make data-driven decisions to fuel your growth.</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-20 md:py-28">
                    <div className="container mx-auto px-4 text-center">
                         <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5 }}
                         >
                            <h2 className="text-3xl md:text-4xl font-bold">Ready to Elevate Your Digital Strategy?</h2>
                            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Join thousands of creators and brands automating their success with TrendXoda. Get started for free, no credit card required.</p>
                            <div className="mt-8">
                                <Button size="lg" asChild className="shadow-lg shadow-primary/20 transition-all">
                                    <Link href="/signup">
                                        Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
        <PublicFooter />
    </div>
  );
}

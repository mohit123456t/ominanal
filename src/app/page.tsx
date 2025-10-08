'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BarChart, Clock } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

const Globe = React.lazy(() => import('@/components/magicui/globe'));

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
    <motion.div 
        className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl border border-slate-200/50 shadow-lg text-center transition-all duration-300 hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-1"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
    >
        <div className="inline-block bg-primary/10 text-primary p-3 rounded-xl mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm">{description}</p>
    </motion.div>
);

const StepCard = ({ step, title, description }: { step: string, title: string, description: string }) => (
    <div className="bg-white/40 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 shadow-md">
         <div className="text-4xl font-black text-primary/20 mb-2">{step}</div>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
)

export default function RootPage() {
  return (
    <div className="w-full font-sans bg-slate-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white">
             <div className="container mx-auto px-4 py-20 md:py-32 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tighter">
                        <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">Eliminate Manual Work</span>, Automate Results.
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
                        OmniPost is your all-in-one AI-powered platform to create, schedule, and analyze your social media presence, freeing you to focus on what matters most.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                         <Button size="lg" asChild className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
                            <Link href="/signup">
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
             <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="h-full w-full bg-slate-100" />}>
                     <Globe />
                </Suspense>
             </div>
        </div>
        
        {/* Features Section */}
        <div className="py-20 md:py-28 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Everything You Need, All in One Place</h2>
                    <p className="mt-3 text-slate-600 max-w-xl mx-auto">From idea to analytics, OmniPost streamlines your entire social media workflow.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <FeatureCard 
                        icon={<Bot size={28}/>}
                        title="AI-Powered Content"
                        description="Generate viral scripts, engaging captions, and stunning thumbnails with our advanced AI tools."
                        delay={0.1}
                   />
                   <FeatureCard 
                        icon={<Clock size={28}/>}
                        title="Automated Posting"
                        description="Schedule your content across all major platforms and let our system post for you at the optimal times."
                        delay={0.2}
                   />
                   <FeatureCard 
                        icon={<BarChart size={28}/>}
                        title="In-Depth Analytics"
                        description="Track your performance, understand your audience, and get actionable insights to fuel your growth."
                        delay={0.3}
                   />
                </div>
            </div>
        </div>

        {/* How it Works Section */}
         <div className="py-20 md:py-28 bg-slate-100/70">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Get Started in 3 Simple Steps</h2>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <StepCard step="01" title="Create a Campaign" description="Define your goals, budget, and content needs for our team and AI to get to work." />
                    <StepCard step="02" title="Review & Approve" description="Collaborate with your assigned team and approve the content they create for you." />
                    <StepCard step="03" title="Automate & Analyze" description="We handle the scheduling and posting. You just sit back and watch your analytics soar." />
                </div>
            </div>
        </div>
    </div>
  );
}

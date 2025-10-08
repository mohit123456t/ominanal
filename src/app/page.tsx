'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BarChart, Clock, Search, Mail, Layers, Trophy } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';


const MotionCard = ({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

const StatCard = ({ icon, value, label, delay = 0 }: { icon: React.ReactNode, value: string, label: string, delay?: number }) => (
    <MotionCard delay={delay} className="bg-card p-6 rounded-2xl shadow-lg border border-border/10 flex flex-col items-center text-center">
        <div className="text-primary mb-3">{icon}</div>
        <div className="text-4xl font-bold text-foreground">{value}</div>
        <div className="text-muted-foreground text-sm mt-1">{label}</div>
    </MotionCard>
)

export default function RootPage() {
  return (
    <div className="w-full font-sans bg-background text-foreground overflow-x-hidden">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20 md:py-28">
           <div className="grid md:grid-cols-2 gap-12 items-center">
                <MotionCard>
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
                </MotionCard>
                 <MotionCard delay={0.2}>
                    <Image 
                        src="https://picsum.photos/seed/hero/800/600" 
                        alt="Dashboard preview" 
                        width={800} 
                        height={600}
                        className="rounded-2xl shadow-2xl"
                        data-ai-hint="dashboard preview"
                    />
                </MotionCard>
           </div>
        </div>
        
        {/* Stats Section */}
        <div className="py-10 md:py-16">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<Bot size={32}/>} value="10x" label="Faster Content Creation" delay={0.1} />
                    <StatCard icon={<Clock size={32}/>} value="20+" label="Hours Saved Weekly" delay={0.2} />
                    <StatCard icon={<BarChart size={32}/>} value="300%" label="Engagement Boost" delay={0.3} />
                    <StatCard icon={<Layers size={32}/>} value="All" label="Platforms in One" delay={0.4} />
                </div>
            </div>
        </div>

        {/* How it works Section */}
        <div id="features" className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4">
                <MotionCard className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">How TrendXoda Works</h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Transform your social media strategy in three simple, powerful steps.</p>
                </MotionCard>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
                    {/* Step 1 */}
                     <MotionCard delay={0.1} className="flex flex-col md:flex-row items-center gap-6 col-span-3">
                        <Image src="https://picsum.photos/seed/step1/600/400" alt="Create with AI" width={500} height={350} className="rounded-2xl shadow-lg w-full md:w-1/2" data-ai-hint="AI creation interface"/>
                        <div className="md:w-1/2">
                            <h3 className="text-2xl font-bold mb-2">1. Create with AI</h3>
                            <p className="text-muted-foreground">Generate viral-worthy captions, scripts, and campaign ideas in seconds. Our AI is your new creative partner, always ready with fresh ideas.</p>
                        </div>
                    </MotionCard>
                     {/* Step 2 */}
                      <MotionCard delay={0.2} className="flex flex-col-reverse md:flex-row items-center gap-6 col-span-3">
                        <div className="md:w-1/2">
                            <h3 className="text-2xl font-bold mb-2">2. Schedule with Ease</h3>
                            <p className="text-muted-foreground">Plan your content calendar visually. Let our AI determine the optimal posting times to maximize reach and engagement, automatically.</p>
                        </div>
                         <Image src="https://picsum.photos/seed/step2/600/400" alt="Schedule content" width={500} height={350} className="rounded-2xl shadow-lg w-full md:w-1/2" data-ai-hint="content calendar schedule"/>
                    </MotionCard>
                     {/* Step 3 */}
                      <MotionCard delay={0.3} className="flex flex-col md:flex-row items-center gap-6 col-span-3">
                        <Image src="https://picsum.photos/seed/step3/600/400" alt="Track Performance" width={500} height={350} className="rounded-2xl shadow-lg w-full md:w-1/2" data-ai-hint="analytics dashboard charts"/>
                        <div className="md:w-1/2">
                            <h3 className="text-2xl font-bold mb-2">3. Track Performance</h3>
                            <p className="text-muted-foreground">Gain deep insights with our beautiful and intuitive analytics. Understand what's working and make data-driven decisions to fuel your growth.</p>
                        </div>
                    </MotionCard>
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 md:py-28">
            <div className="container mx-auto px-4 text-center">
                 <MotionCard>
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to Elevate Your Digital Strategy?</h2>
                    <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Join thousands of creators and brands automating their success with TrendXoda. Get started for free, no credit card required.</p>
                    <div className="mt-8">
                        <Button size="lg" asChild className="shadow-lg shadow-primary/20 transition-all">
                            <Link href="/signup">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </MotionCard>
            </div>
        </div>
    </div>
  );
}

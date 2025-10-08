'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BarChart, Clock, Search, Mail, Layers, Trophy } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Globe from "@/components/magicui/globe";

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

const features = [
    {
      icon: <Bot />,
      title: "AI-Powered Content",
      description: "Generate engaging captions, viral video scripts, and brilliant campaign ideas in seconds.",
    },
    {
      icon: <Clock />,
      title: "Smart Scheduling",
      description: "Automate your content calendar and let our AI determine the best time to post for maximum reach.",
    },
    {
      icon: <BarChart />,
      title: "In-depth Analytics",
      description: "Track your growth, engagement, and reach with our beautiful and easy-to-understand analytics.",
    },
    {
      icon: <Search />,
      title: "Trend Analysis",
      description: "Discover trending topics and hashtags in your niche to stay ahead of the curve.",
    },
     {
      icon: <Layers />,
      title: "Multi-Platform Support",
      description: "Manage all your social media accounts including Instagram, Facebook, X, and more from one place.",
    },
    {
      icon: <Trophy />,
      title: "Competitor Tracking",
      description: "Keep an eye on your competitors' strategies and performance to gain a competitive edge.",
    },
  ];

export default function RootPage() {
  return (
    <div className="w-full font-sans bg-background text-foreground overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
            <div className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10">
                <MotionCard>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        The Future of Social Media is Here.
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                        TrendXoda is your intelligent, all-in-one platform to create, schedule, and analyze your social media presence, freeing you to focus on what matters most: growth.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
                            <Link href="/signup">
                                Get Started For Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="#features">
                                Learn More
                            </Link>
                        </Button>
                    </div>
                </MotionCard>
            </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-0">
                <Suspense fallback={<div className="w-full h-full bg-black" />}>
                  <Globe />
                </Suspense>
              </div>
        </div>
        
        {/* Features Section */}
        <div id="features" className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <MotionCard className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Everything You Need. All in One Place.</h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">From content creation to performance analysis, TrendXoda provides the tools to elevate your social media game.</p>
                </MotionCard>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <MotionCard key={index} delay={index * 0.1}>
                           <div className="p-8 rounded-lg bg-secondary/50 border border-border h-full">
                                <div className="text-primary mb-4">{React.cloneElement(feature.icon, { className: "h-8 w-8" })}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        </MotionCard>
                    ))}
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

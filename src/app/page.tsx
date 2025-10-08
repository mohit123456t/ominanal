'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BarChart, Clock, Search, Mail, Layers } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const MotionCard = ({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
        {children}
    </motion.div>
);

const services = [
    { title: "Search Engine Optimization", description: "Boost your organic reach and climb the search rankings with our data-driven SEO strategies." },
    { title: "Pay-per-Click Advertising", description: "Get immediate, targeted traffic with expertly managed PPC campaigns on Google, Meta, and more." },
    { title: "Social Media Marketing", description: "Build a vibrant community and drive engagement with compelling content and smart social strategies." },
    { title: "Email Marketing", description: "Nurture leads and retain customers with personalized and automated email marketing workflows." },
    { title: "Content Creation", description: "From blog posts to viral videos, our creative team produces content that captivates and converts." },
    { title: "Analytics and Tracking", description: "Make informed decisions with comprehensive analytics, tracking, and reporting." },
];

const testimonials = PlaceHolderImages.filter(img => img.id.startsWith('user-avatar')).slice(0, 4).map((img, i) => ({
    ...img,
    name: ['Jonathan', 'Michael', 'Sarah', 'Jessica'][i],
    role: ['Director of Operations', 'Social Media Specialist', 'Marketing Director', 'CEO, Creative Co.'][i],
    quote: [
        "In six months, our organic traffic is up 300%. The results speak for themselves.",
        "OmniPost's AI tools are a game-changer for content creation. What used to take days now takes minutes.",
        "Their team is incredibly responsive and brought a new level of creativity to our campaigns.",
        "We've seen a 40% increase in lead conversion since we started using their automated systems."
    ][i]
}));

export default function RootPage() {
  return (
    <div className="w-full font-sans bg-background text-foreground overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
             <div className="container mx-auto px-4 py-24 md:py-36 text-center relative z-10">
                <MotionCard>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
                        <span className="bg-gradient-to-r from-accent via-green-400 to-emerald-500 bg-clip-text text-transparent">Eliminate Manual Work</span>, Automate Success.
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                        OmniPost is your intelligent, all-in-one platform to create, schedule, and analyze your social media presence, freeing you to focus on growth.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                         <Button size="lg" asChild className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
                            <Link href="/signup">
                                Get Started For Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                         <Button size="lg" variant="outline" asChild>
                            <Link href="#services">
                                Explore Services
                            </Link>
                        </Button>
                    </div>
                </MotionCard>
            </div>
        </div>
        
        {/* Services Section */}
        <div id="services" className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4">
                 <MotionCard className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">A Full Suite of Digital Services</h2>
                    <p className="mt-3 text-muted-foreground max-w-xl mx-auto">From strategy to execution, we've got you covered. All powered by AI and expert insights.</p>
                </MotionCard>
                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {services.map((service, index) => (
                            <MotionCard key={service.title} delay={index * 0.1}>
                                <AccordionItem value={`item-${index}`} className="border border-border bg-background/30 rounded-lg mb-3 shadow-sm hover:border-accent/50 transition-colors">
                                    <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                        {service.title}
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 text-muted-foreground">
                                        {service.description}
                                    </AccordionContent>
                                </AccordionItem>
                            </MotionCard>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
        
        {/* Testimonials */}
        <div className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <MotionCard className="text-center mb-12">
                     <h2 className="text-3xl md:text-4xl font-bold">Loved by Growing Brands</h2>
                    <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Don't just take our word for it. Here's what our clients have to say.</p>
                </MotionCard>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((testimonial, index) => (
                         <MotionCard key={testimonial.name} delay={index * 0.1}>
                            <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full flex flex-col">
                                <p className="text-muted-foreground flex-grow">"{testimonial.quote}"</p>
                                <div className="flex items-center mt-4 pt-4 border-t border-border">
                                    <Image src={testimonial.imageUrl} alt={testimonial.name} width={40} height={40} className="rounded-full" />
                                    <div className="ml-3">
                                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </MotionCard>
                    ))}
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4 text-center">
                 <MotionCard>
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to Elevate Your Digital Strategy?</h2>
                    <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Let's make things happen. Join OmniPost today and start automating your success.</p>
                    <div className="mt-8">
                        <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all">
                             <Link href="/signup">
                                Request a Free Proposal <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </MotionCard>
            </div>
        </div>
    </div>
  );
}

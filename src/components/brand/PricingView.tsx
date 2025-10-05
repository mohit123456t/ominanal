'use client';
import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, ShieldCheck, Zap, LoaderCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


const PricingView = () => {
    const { firestore } = useFirebase();
    const [expectedReels, setExpectedReels] = useState(50);
    const [totalCost, setTotalCost] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [expectedViews, setExpectedViews] = useState(0);
    
    // Fetch pricing settings from Firestore
    const pricingDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'pricing') : null, [firestore]);
    const { data: priceSettings, isLoading: loading, error } = useDoc(pricingDocRef);

    const pricePerReel = priceSettings?.pricePerReel || 150;
    const avgViewsPerReel = priceSettings?.avgViewsPerReel || 5000;
    const discountTiers = priceSettings?.discountTiers || [];

    // Calculate cost and views when inputs change
    useEffect(() => {
        const reels = expectedReels;
        if (isNaN(reels) || reels <= 0 || !priceSettings) {
            setTotalCost(0);
            setDiscountAmount(0);
            setExpectedViews(0);
            return;
        }

        let applicableDiscount = 0;
        const sortedTiers = [...discountTiers].sort((a: any, b: any) => b.reels - a.reels);
        const applicableTier = sortedTiers.find((tier: any) => reels >= tier.reels);
        if (applicableTier) {
            applicableDiscount = applicableTier.discount / 100;
        }

        const baseCost = reels * pricePerReel;
        const discount = baseCost * applicableDiscount;
        const finalCost = baseCost - discount;

        setTotalCost(finalCost);
        setDiscountAmount(discount);
        setExpectedViews(reels * avgViewsPerReel);

    }, [expectedReels, pricePerReel, avgViewsPerReel, discountTiers, priceSettings]);


    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatViews = (views: number) => {
        if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toLocaleString('en-IN');
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <LoaderCircle className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="mt-4 text-lg font-semibold text-slate-700">Loading pricing...</p>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="flex flex-col items-center justify-center h-64 bg-red-500/10 rounded-2xl border border-red-500/20">
                <h3 className="text-xl font-bold text-red-800">Error Loading Pricing</h3>
                <p className="mt-2 text-red-700">{error.message}</p>
            </div>
        );
    }

    const features = [
        { icon: <TrendingUp />, title: "Advanced Analytics", description: "In-depth insights into your campaign performance." },
        { icon: <Sparkles />, title: "AI-Powered Suggestions", description: "Get content and strategy ideas from our AI." },
        { icon: <ShieldCheck />, title: "Priority Support", description: "Dedicated support to help you succeed." },
        { icon: <Zap />, title: "Faster Turnaround", description: "Your campaigns get higher priority in the queue." },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-12"
        >
            <div className="text-center">
                 <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tighter">
                    Flexible Pricing for Your Growth
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    Use our interactive calculator to estimate your campaign cost instantly. More reels mean more savings!
                </p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-300/70 shadow-lg shadow-slate-200/80">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Campaign Calculator
                        </h2>
                        <p className="text-slate-600 mb-6">Drag the slider to select the number of reels.</p>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline">
                                <label className="block text-lg font-semibold text-slate-700">
                                    Number of Reels
                                </label>
                                <span className="text-4xl font-bold text-indigo-600 tracking-tighter">{expectedReels}</span>
                            </div>
                             <Slider
                                defaultValue={[50]}
                                max={200}
                                step={5}
                                value={[expectedReels]}
                                onValueChange={(value) => setExpectedReels(value[0])}
                                className="w-full"
                            />
                        </div>

                         <div className="text-sm text-slate-700 space-y-2 mt-6 p-4 bg-slate-900/5 rounded-lg border border-slate-900/10">
                            <p>✓ Price per Reel: <strong>{formatCurrency(pricePerReel)}</strong></p>
                            <p>✓ Volume discounts up to <strong>{Math.max(...discountTiers.map((t:any) => t.discount), 0)}%</strong> automatically applied</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900/5 rounded-2xl p-6 border border-slate-900/10 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 text-center mb-4">Your Estimate</h3>
                            <motion.div
                                 key={totalCost}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 className="text-center"
                            >
                                <div className="text-5xl font-extrabold text-green-700 tracking-tight">{formatCurrency(totalCost)}</div>
                                {discountAmount > 0 && (
                                    <p className="text-green-800 font-semibold mt-1">You saved {formatCurrency(discountAmount)}!</p>
                                )}
                            </motion.div>
                        </div>
                        
                         <div className="text-center border-t border-slate-900/10 pt-4">
                            <h4 className="flex items-center justify-center text-lg font-bold text-slate-800 mb-2"><Eye className="mr-2"/>Estimated Views</h4>
                             <motion.div
                                 key={expectedViews}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 className="text-4xl font-extrabold text-blue-700 tracking-tight"
                            >
                                {formatViews(expectedViews)}
                            </motion.div>
                         </div>
                        
                        <button className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                            Start Campaign
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center">
                 <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tighter">
                    Features Included in Every Plan
                </h2>
                <p className="text-slate-600 max-w-xl mx-auto">Get the most out of your campaigns with our premium features, included at no extra cost.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                         <motion.div 
                             key={feature.title} 
                             className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-300/70 shadow-lg shadow-slate-200/80 flex items-start gap-4"
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <div className="text-2xl text-indigo-600 bg-indigo-100 p-3 rounded-lg">{feature.icon}</div>
                            <div>
                                <h3 className="font-bold text-slate-800">{feature.title}</h3>
                                <p className="text-sm text-slate-600 mt-1">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
            </div>
            
        </motion.div>
    );
};

export default PricingView;

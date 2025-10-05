'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Video, Bell, Settings, Download, UserCircle, TrendingUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';


const PricingView = () => {
    const [expectedReels, setExpectedReels] = useState(50);
    const [totalCost, setTotalCost] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    
    // Placeholder pricing state
    const [pricePerReel, setPricePerReel] = useState(150);
    const [discountTiers, setDiscountTiers] = useState([{reels: 10, discount: 0.05}, {reels: 20, discount: 0.1}, {reels: 50, discount: 0.15}, {reels: 100, discount: 0.2}]);
    const [loading, setLoading] = useState(false);

    // Calculate cost and views when inputs change
    useEffect(() => {
        const reels = expectedReels;
        if (isNaN(reels) || reels <= 0) {
            setTotalCost(0);
            setDiscountAmount(0);
            return;
        }

        let applicableDiscount = 0;
        const sortedTiers = [...discountTiers].sort((a, b) => b.reels - a.reels);
        const applicableTier = sortedTiers.find(tier => reels >= tier.reels);
        if (applicableTier) {
            applicableDiscount = applicableTier.discount;
        }

        const baseCost = reels * pricePerReel;
        const discount = baseCost * applicableDiscount;
        const finalCost = baseCost - discount;

        setTotalCost(finalCost);
        setDiscountAmount(discount);

    }, [expectedReels, pricePerReel, discountTiers]);


    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (loading) {
        return <div className="text-center p-10">Loading pricing...</div>
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
                            <p>✓ Volume discounts up to <strong>20%</strong> automatically applied</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900/5 rounded-2xl p-6 border border-slate-900/10 space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 text-center">Your Estimated Cost</h3>
                        
                        <AnimatePresence mode="wait">
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
                        </AnimatePresence>

                        <ul className="text-sm text-slate-600 space-y-2 pt-4 border-t border-slate-900/10">
                            <li className="flex justify-between"><span>Base Price:</span> <span className="font-medium text-slate-700">{formatCurrency(expectedReels * pricePerReel)}</span></li>
                            <li className="flex justify-between"><span>Volume Discount:</span> <span className="font-medium text-green-700">- {formatCurrency(discountAmount)}</span></li>
                        </ul>
                        
                        <button className="mt-4 w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
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

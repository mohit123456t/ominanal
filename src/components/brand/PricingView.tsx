'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Video, Bell, Settings, Download, UserCircle } from 'lucide-react';

const PricingView = () => {
    const [expectedReels, setExpectedReels] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [expectedViews, setExpectedViews] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Placeholder pricing state
    const [pricePerReel, setPricePerReel] = useState(150);
    const [avgViewsPerReel, setAvgViewsPerReel] = useState(5000);
    const [discountTiers, setDiscountTiers] = useState([{reels: 10, discount: 0.05}, {reels: 20, discount: 0.1}]);
    const [loading, setLoading] = useState(false);

    // Calculate cost and views when inputs change
    useEffect(() => {
        const reels = parseFloat(expectedReels);
        if (isNaN(reels) || reels <= 0) {
            setTotalCost(0);
            setExpectedViews(0);
            return;
        }

        let applicableDiscount = 0;
        const sortedTiers = [...discountTiers].sort((a, b) => a.reels - b.reels);
        for (let i = sortedTiers.length - 1; i >= 0; i--) {
            if (reels >= sortedTiers[i].reels) {
                applicableDiscount = sortedTiers[i].discount;
                break;
            }
        }

        const baseCost = reels * pricePerReel;
        const discountedCost = baseCost * (1 - applicableDiscount);
        const views = reels * avgViewsPerReel;

        setTotalCost(discountedCost);
        setExpectedViews(views);
        
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

    }, [expectedReels, pricePerReel, avgViewsPerReel, discountTiers]);

    const handleExpectedReelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setExpectedReels(value);
        }
    };

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatNumber = (number: number) => number.toLocaleString('en-IN');

    const getDiscountInfo = () => {
        const reels = parseFloat(expectedReels);
        if (isNaN(reels) || reels <= 0) return null;

        const sortedTiers = [...discountTiers].sort((a, b) => a.reels - b.reels);
        for (let i = sortedTiers.length - 1; i >= 0; i--) {
            if (reels >= sortedTiers[i].reels) {
                return {
                    percentage: sortedTiers[i].discount * 100,
                    amount: (reels * pricePerReel * sortedTiers[i].discount)
                };
            }
        }
        return null;
    };

    const discountInfo = getDiscountInfo();

    if (loading) {
        return <div className="text-center p-10">Loading pricing...</div>
    }

    const features = [
        { icon: <BarChart />, title: "Advanced Analytics" },
        { icon: <Video />, title: "HD Video Quality" },
        { icon: <Bell />, title: "Priority Support" },
        { icon: <Settings />, title: "Custom Branding" },
        { icon: <Download />, title: "Bulk Export" },
        { icon: <UserCircle />, title: "Account Manager" }
    ];

    return (
        <div className="animate-fade-in max-w-5xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-200">
            <div className="mb-10 text-center">
                 <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                    Campaign Pricing Calculator
                </h1>
                <p className="text-slate-700 text-lg max-w-2xl mx-auto">
                    Estimate your campaign cost based on the number of reels and see your potential reach.
                </p>
            </div>
            
            <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-8 mb-12 border border-white/50 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            Calculate Your Cost
                        </h2>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Number of Reels
                            </label>
                             <input
                                type="text"
                                value={expectedReels}
                                onChange={handleExpectedReelsChange}
                                placeholder="e.g., 100"
                                className="w-full px-4 py-3 bg-white/50 border border-white/70 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition text-lg"
                            />
                        </div>
                        
                        <div className="text-sm text-slate-700 space-y-2">
                            <p>✓ Fixed price of ₹{pricePerReel} per reel</p>
                            <p>✓ Average {formatNumber(avgViewsPerReel)} views per reel</p>
                            <p>✓ Volume discounts available</p>
                        </div>
                    </div>
                    
                    <div className={`bg-black/5 rounded-2xl p-6 transition-all duration-300 ${isAnimating ? 'transform scale-105' : ''}`}>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Your Estimate</h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-md">
                                <span className="text-slate-600">Base Price:</span>
                                <span className="font-medium text-slate-800">{formatCurrency(parseFloat(expectedReels || '0') * pricePerReel)}</span>
                            </div>
                            
                            {discountInfo && (
                                <div className="flex justify-between items-center text-md text-green-700">
                                    <span>Volume Discount ({discountInfo.percentage}%):</span>
                                    <span>-{formatCurrency(discountInfo.amount)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center text-xl font-bold border-t border-slate-300/70 pt-3 mt-3">
                                <span className="text-slate-800">Total Cost:</span>
                                <span className="text-green-700">{formatCurrency(totalCost)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-lg border-t border-slate-300/70 pt-3 mt-3">
                                <span className="text-slate-800">Expected Views:</span>
                                <span className="font-bold text-blue-700">{formatNumber(expectedViews)}</span>
                            </div>
                        </div>
                        
                        <button className="mt-6 w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors shadow-md">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-8 mb-12 border border-white/50 shadow-lg">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Premium Features
                    </h2>
                    <p className="text-slate-700">
                        Unlock more with your brand subscription.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {features.map((feature) => (
                        <div key={feature.title} className="bg-black/5 rounded-lg p-4 text-center">
                            <div className="text-3xl text-slate-700 mb-2 inline-block">{feature.icon}</div>
                            <h3 className="font-semibold text-slate-800 text-sm">{feature.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-slate-700 mb-4">
                    Need a custom quote or have questions?
                </p>
                <button className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-900 transition-colors inline-flex items-center">
                    Contact Sales
                </button>
            </div>
        </div>
    );
};

export default PricingView;

    
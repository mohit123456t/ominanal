
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash, Plus } from 'lucide-react';


const ManagementCard = ({ title, children }: {title: string, children: React.ReactNode}) => (
    <motion.div
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </motion.div>
);

const InputField = ({ label, type = 'number', value, onChange, placeholder }: {label: string, type?: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string}) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
    </div>
);

const PricingManagement = () => {
    const [pricePerReel, setPricePerReel] = useState(150);
    const [avgViewsPerReel, setAvgViewsPerReel] = useState(5000);
    const [discountTiers, setDiscountTiers] = useState([
      { reels: 10, discount: 5 },
      { reels: 20, discount: 10 },
    ]);
    const [coupons, setCoupons] = useState([
        { id: 'LAUNCH20', discount: 20, limit: 100, used: 25, isActive: true },
        { id: 'NEWYEAR', discount: 15, limit: 'unlimited' as 'unlimited' | number, used: 150, isActive: true },
    ]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', limit: '' });
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    const handleAddTier = () => {
        setDiscountTiers([...discountTiers, { reels: 0, discount: 0 }]);
    };

    const handleUpdateTier = (index: number, field: 'reels' | 'discount', value: string) => {
        const updatedTiers = [...discountTiers];
        updatedTiers[index][field] = Number(value);
        setDiscountTiers(updatedTiers);
    };
    
    const handleRemoveTier = (index: number) => {
        setDiscountTiers(discountTiers.filter((_, i) => i !== index));
    };
    
    const handleAddCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;
        const newCouponData = {
            id: newCoupon.code.toUpperCase(),
            discount: Number(newCoupon.discount),
            limit: newCoupon.limit ? Number(newCoupon.limit) : 'unlimited' as 'unlimited' | number,
            used: 0,
            isActive: true,
        };
        setCoupons(prev => [...prev, newCouponData]);
        setNewCoupon({ code: '', discount: '', limit: '' });
    };

    const handleDeleteCoupon = (couponId: string) => {
        setCoupons(coupons.filter(c => c.id !== couponId));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        console.log("Saving pricing changes:", { pricePerReel, avgViewsPerReel, discountTiers });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><p>Loading pricing settings...</p></div>;
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Pricing & Coupon Management</h1>
                <p className="text-slate-500 mt-1">Set campaign pricing, volume discounts, and promotional coupons.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ManagementCard title="Base Pricing">
                         <InputField 
                            label="Price per Reel (₹)" 
                            value={pricePerReel} 
                            onChange={(e) => setPricePerReel(Number(e.target.value))}
                        />
                         <InputField 
                            label="Average Views per Reel (for estimation)" 
                            value={avgViewsPerReel} 
                            onChange={(e) => setAvgViewsPerReel(Number(e.target.value))}
                        />
                    </ManagementCard>

                    <ManagementCard title="Volume Discounts">
                        {discountTiers.map((tier, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 rounded-md hover:bg-black/5">
                                <span className="font-medium text-slate-700">If reels ≥</span>
                                <input type="number" value={tier.reels} onChange={e => handleUpdateTier(index, 'reels', e.target.value)} className="w-24 px-2 py-1 bg-white/50 border rounded-md"/>
                                <span className="font-medium text-slate-700">, give</span>
                                <input type="number" value={tier.discount} onChange={e => handleUpdateTier(index, 'discount', e.target.value)} className="w-20 px-2 py-1 bg-white/50 border rounded-md"/>
                                <span className="font-medium text-slate-700">% discount.</span>
                                <button onClick={() => handleRemoveTier(index)} className="text-red-500 hover:text-red-700 ml-auto"><Trash/></button>
                            </div>
                        ))}
                        <button onClick={handleAddTier} className="mt-2 text-indigo-600 font-semibold text-sm flex items-center">
                           <span className="mr-1"><Plus/></span> Add Discount Tier
                        </button>
                    </ManagementCard>
                    
                    <div className="flex justify-end">
                        <motion.button 
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 disabled:bg-indigo-400"
                            whileHover={{ scale: isSaving ? 1 : 1.05 }}
                        >
                            {isSaving ? 'Saving...' : 'Save All Pricing Changes'}
                        </motion.button>
                    </div>
                </div>
                
                <div className="space-y-8">
                     <ManagementCard title="Create New Coupon">
                        <form onSubmit={handleAddCoupon} className="space-y-4">
                            <InputField 
                                label="Coupon Code"
                                type="text"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                placeholder="e.g., LAUNCH20"
                            />
                            <InputField 
                                label="Discount Percentage (%)"
                                value={newCoupon.discount}
                                onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})}
                                placeholder="e.g., 20"
                            />
                            <InputField 
                                label="Usage Limit (optional)"
                                value={newCoupon.limit}
                                onChange={e => setNewCoupon({...newCoupon, limit: e.target.value})}
                                placeholder="e.g., 100"
                            />
                            <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900 transition-colors shadow-md">
                                Create Coupon
                            </button>
                        </form>
                    </ManagementCard>

                    <ManagementCard title="Active Coupons">
                        {coupons.map(coupon => (
                            <div key={coupon.id} className="flex justify-between items-center bg-black/5 p-3 rounded-lg">
                                <div>
                                    <p className="font-mono text-slate-900 font-bold">{coupon.id}</p>
                                    <p className="text-sm text-slate-600">{coupon.discount}% off | Used: {coupon.used}/{coupon.limit}</p>
                                </div>
                                <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700"><Trash/></button>
                            </div>
                        ))}
                         {coupons.length === 0 && <p className="text-slate-500 text-center py-4">No active coupons found.</p>}
                    </ManagementCard>
                </div>
            </div>
        </div>
    );
};

export default PricingManagement;

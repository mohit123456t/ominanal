'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NewCampaignForm = ({ onCreateCampaign, onCancel }: { onCreateCampaign: (campaign: any) => void; onCancel: () => void; }) => {
    const [campaignData, setCampaignData] = useState({
        name: '',
        description: '',
        expectedReels: '',
        deadline: '',
    });

    const [uploadOption, setUploadOption] = useState('gdrive');
    const [gdriveLink, setGdriveLink] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [priceSettings, setPriceSettings] = useState({ pricePerReel: 150, discountTiers: [{reels: 10, discount: 5}, {reels: 20, discount: 10}] });
    const [totalBudget, setTotalBudget] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [error, setError] = useState('');
    const [loadingPricing, setLoadingPricing] = useState(false);
    const [balance, setBalance] = useState(100000); // Placeholder balance
    const [loadingBalance, setLoadingBalance] = useState(false);

    // Calculate total budget
    useEffect(() => {
        const reels = parseInt(campaignData.expectedReels, 10);
        if (isNaN(reels) || reels <= 0 || loadingPricing) {
            setTotalBudget(0);
            return;
        }

        const { pricePerReel, discountTiers } = priceSettings;
        let baseCost = reels * pricePerReel;
        let volumeDiscount = 0;

        const sortedTiers = [...(discountTiers || [])].sort((a, b) => b.reels - a.reels);
        const applicableTier = sortedTiers.find(tier => reels >= tier.reels);
        if (applicableTier) {
            volumeDiscount = baseCost * (applicableTier.discount / 100);
        }
        let costAfterVolumeDiscount = baseCost - volumeDiscount;

        if (appliedCoupon) {
            const couponDiscount = costAfterVolumeDiscount * (appliedCoupon.discount / 100);
            setTotalBudget(costAfterVolumeDiscount - couponDiscount);
        } else {
            setTotalBudget(costAfterVolumeDiscount);
        }
    }, [campaignData.expectedReels, priceSettings, appliedCoupon, loadingPricing]);

    const handleApplyCoupon = async () => {
        setCouponError('');
        setCouponSuccess('');
        if (!couponCode) {
            setCouponError('Please enter a coupon code.');
            return;
        }
        // Placeholder logic
        if (couponCode.toUpperCase() === 'FIRST10') {
             setAppliedCoupon({ code: 'FIRST10', discount: 10 });
             setCouponSuccess(`Coupon "FIRST10" applied! You get 10% off.`);
        } else {
             setCouponError('Invalid or expired coupon code.');
             setAppliedCoupon(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCampaignData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Balance Check
        if (totalBudget > balance) {
            setError(`Insufficient funds. Your current balance is ${formatCurrency(balance)}, but the campaign requires ${formatCurrency(totalBudget)}. Please add funds to continue.`);
            return;
        }

        if (!campaignData.name || !campaignData.expectedReels || !campaignData.deadline) {
            setError('Campaign Name, Number of Reels, and Deadline are required.');
            return;
        }
        if (uploadOption === 'gdrive' && !gdriveLink) {
             setError('Please provide a Google Drive link.');
            return;
        }
         if (uploadOption === 'file' && !file) {
            setError('Please upload a video file.');
            return;
        }

        const { ...restOfCampaignData } = campaignData;

        const newCampaign = {
            ...restOfCampaignData,
            budget: totalBudget,
            reels: parseInt(campaignData.expectedReels, 10),
            uploadOption,
            gdriveLink: uploadOption === 'gdrive' ? gdriveLink : '',
            file: uploadOption === 'file' ? file : null,
            coupon: appliedCoupon ? appliedCoupon.code : null
        };
        
        alert("Campaign created! (This is a demo, not saved to DB)");
        onCreateCampaign(newCampaign);
    };

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300/70 w-full max-w-3xl flex flex-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-300/70">
                        <h2 className="text-2xl font-bold text-slate-900">Launch a New Campaign</h2>
                    </div>
                    
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-800 text-sm font-medium border border-red-500/20">{error}</div>}
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Campaign Name</label>
                            <input type="text" name="name" value={campaignData.name} onChange={handleChange} className="w-full text-base px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition placeholder:text-slate-500" placeholder="e.g., Diwali Special Sale" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Description</label>
                            <textarea name="description" value={campaignData.description} onChange={handleChange} rows={3} className="w-full text-base px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition placeholder:text-slate-500" placeholder="Describe campaign goals..."></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Video Asset</label>
                            <div className="flex bg-black/5 rounded-xl p-1 mb-3">
                                <button type="button" onClick={() => setUploadOption('gdrive')} className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition-colors ${uploadOption === 'gdrive' ? 'bg-white/80 shadow' : 'text-slate-600'}`}>Google Drive Link</button>
                                <button type="button" onClick={() => setUploadOption('file')} className={`w-1/2 py-2 rounded-lg text-sm font-semibold transition-colors ${uploadOption === 'file' ? 'bg-white/80 shadow' : 'text-slate-600'}`}>Upload File</button>
                            </div>
                            {uploadOption === 'gdrive' ? (
                                <input type="text" value={gdriveLink} onChange={e => setGdriveLink(e.target.value)} className="w-full text-base px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition" placeholder="https://drive.google.com/..." />
                            ) : (
                                <input type="file" onChange={handleFileChange} accept="video/*" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200/50 file:text-slate-700 hover:file:bg-slate-200" />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">Number of Reels</label>
                                <input type="number" name="expectedReels" value={campaignData.expectedReels} onChange={handleChange} className="w-full text-base px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition" placeholder="e.g., 50" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">Deadline</label>
                                <input type="date" name="deadline" value={campaignData.deadline} onChange={handleChange} className="w-full text-base px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Coupon Code (Optional)</label>
                            <div className="flex gap-2">
                                <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="w-full text-base px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition" placeholder="e.g., FIRST10" />
                                <button type="button" onClick={handleApplyCoupon} className="px-6 py-3 font-semibold text-slate-800 bg-white/40 hover:bg-white/60 rounded-lg transition-colors">Apply</button>
                            </div>
                            {couponError && <p className="text-xs text-red-700 mt-1 font-medium">{couponError}</p>}
                            {couponSuccess && <p className="text-xs text-green-700 mt-1 font-medium">{couponSuccess}</p>}
                        </div>

                        <div className="bg-black/5 p-6 rounded-xl border border-slate-300/50">
                            <div className="flex justify-between items-center">
                                 <label className="block text-sm font-bold text-slate-800 mb-2">Estimated Budget</label>
                                 <p className="text-xs text-slate-600 font-medium">Your Balance: {loadingBalance ? 'Loading...' : formatCurrency(balance)}</p>
                             </div>
                             <div className="text-4xl font-bold text-slate-900 tracking-tight">
                                {loadingPricing ? 'Calculating...' : formatCurrency(totalBudget)}
                             </div>
                             <p className="text-xs text-slate-600 mt-1">Budget is calculated automatically based on the number of reels and discounts.</p>
                        </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-300/70 flex justify-end space-x-4">
                        <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold text-slate-800 bg-white/40 hover:bg-white/60 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-3 font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-all">Create Campaign</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default NewCampaignForm;

    
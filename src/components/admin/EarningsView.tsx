'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

// Helper to format currency
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const EarningsView = ({ campaigns, setView }: { campaigns: any[], setView: (view: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const completedCampaigns = campaigns.filter(c => c.status === 'Completed');
    const totalEarnings = completedCampaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);

    const filteredCampaigns = completedCampaigns.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div 
            className="bg-white/50 backdrop-blur-2xl rounded-2xl border border-white/30 shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-3xl font-bold text-slate-800 tracking-tighter">Campaign Earnings</h2>
                 <button 
                    onClick={() => setView('finance')} 
                    className="flex items-center text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors"
                >
                    <span className="mr-2"><ArrowLeft /></span>
                    Back to Finance
                </button>
            </div>
            
            <div className="bg-slate-900/5 p-6 rounded-xl border border-slate-900/10 mb-6">
                 <label className="block text-sm font-bold text-slate-800 mb-2">Total Earnings from Completed Campaigns</label>
                 <div className="text-4xl font-bold text-slate-900 tracking-tight">
                    {formatCurrency(totalEarnings)}
                 </div>
            </div>

            <div className="mb-4">
                 <input 
                    type="text"
                    placeholder="Search completed campaigns by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-3 bg-white/60 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition placeholder:text-slate-500"
                />
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                    <thead className="border-b-2 border-slate-300/50">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign Name</th>
                            <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Reels</th>
                            <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Coupon Used</th>
                            <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Earning</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300/50">
                        {filteredCampaigns.length > 0 ? filteredCampaigns.map(campaign => (
                            <tr key={campaign.id} className="hover:bg-white/40 transition-colors duration-200">
                                <td className="p-4 font-medium text-slate-800">{campaign.name}</td>
                                <td className="p-4 text-center font-medium">{campaign.reelsCount || 0}</td>
                                <td className="p-4 text-center">
                                    {campaign.coupon ? (
                                        <span className="font-mono text-xs bg-sky-100 text-sky-700 font-semibold px-2 py-1 rounded-full">{campaign.coupon}</span>
                                    ) : (
                                        <span className="text-xs text-slate-500">N/A</span>
                                    )}
                                </td>
                                <td className="p-4 font-mono text-slate-800 text-right font-semibold">{formatCurrency(campaign.budget)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-slate-500">
                                    {searchTerm ? 'No campaigns match your search.' : 'No completed campaigns found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default EarningsView;

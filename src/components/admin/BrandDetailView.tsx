'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Wallet, ShoppingCart, LoaderCircle } from 'lucide-react';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';

const InfoCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
    <div className="bg-white/40 backdrop-blur-lg p-5 rounded-2xl border border-slate-300/50 shadow-lg shadow-slate-200/50">
        <div className="flex items-center">
            <div className={`p-3 rounded-xl mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-600">{label}</p>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    </div>
);


const BrandDetailView = ({ brandId, onBack }: { brandId: string, onBack: () => void }) => {
    const { firestore } = useFirebase();

    // Fetch brand's user document
    const brandDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', brandId) : null, [firestore, brandId]);
    const { data: brand, isLoading: brandLoading } = useDoc<any>(brandDocRef);
    
    // Fetch campaigns for this brand
    const campaignsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'campaigns'), where('brandId', '==', brandId)) : null
    , [firestore, brandId]);
    const { data: campaigns, isLoading: campaignsLoading } = useCollection<any>(campaignsQuery);

    const totalSpend = useMemo(() => {
        if (!campaigns) return 0;
        return campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
    }, [campaigns]);

    const formatCurrency = (amount: number) => `₹${(amount || 0).toLocaleString('en-IN')}`;
    const formatDate = (timestamp: any) => {
        if (!timestamp?.seconds) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };
    
    const loading = brandLoading || campaignsLoading;

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="w-12 h-12 animate-spin text-indigo-600"/></div>;
    }

    if (!brand) {
        return (
            <div>
                <button onClick={onBack} className="flex items-center mb-4 text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Management
                </button>
                <p className="text-center p-8 bg-red-100 text-red-700 rounded-lg">Brand not found.</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
             <button onClick={onBack} className="flex items-center mb-6 text-slate-600 hover:text-slate-900 font-semibold text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Management
            </button>
            <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {brand.brandName?.charAt(0).toUpperCase() || 'B'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">{brand.brandName}</h1>
                    <p className="text-slate-500">{brand.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InfoCard icon={<User/>} label="Contact Person" value={brand.name} color="bg-blue-100 text-blue-600" />
                <InfoCard icon={<Phone/>} label="Mobile" value={brand.mobileNumber || 'N/A'} color="bg-green-100 text-green-600" />
                <InfoCard icon={<Wallet/>} label="Wallet Balance" value={formatCurrency(brand.balance)} color="bg-yellow-100 text-yellow-600" />
                <InfoCard icon={<ShoppingCart/>} label="Total Spend" value={formatCurrency(totalSpend)} color="bg-purple-100 text-purple-600" />
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80">
                <h2 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300/50">Campaigns</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-300/50">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign Name</th>
                                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Budget</th>
                                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Created On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300/50">
                           {campaigns && campaigns.length > 0 ? campaigns.map(campaign => (
                                <tr key={campaign.id} className="hover:bg-white/30 transition-colors">
                                    <td className="p-4 font-medium text-slate-800">{campaign.name}</td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                                            campaign.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            campaign.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                                            campaign.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-700">{formatCurrency(campaign.budget)}</td>
                                    <td className="p-4 text-slate-600">{formatDate(campaign.createdAt)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-10 text-slate-500">This brand has not created any campaigns yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default BrandDetailView;

'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

interface Brand {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    address?: string;
    industry?: string;
    followers?: number;
}

const LeadsPanel = () => {
    const { firestore } = useFirebase();
    const [searchTerm, setSearchTerm] = useState('');

    const brandsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'users'), where('role', '==', 'brand')) : null
    , [firestore]);
    const { data: brands, isLoading } = useCollection<Brand>(brandsQuery);

    const filteredLeads = useMemo(() => {
        if (!brands) return [];
        return brands.filter(brand =>
            brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.industry?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [brands, searchTerm]);
    
    const handleWhatsAppContact = (brand: Brand) => {
        const mobile = brand.mobileNumber;
        if (!mobile) {
            alert('Mobile number not available for this brand.');
            return;
        }
        const message = `Hello ${brand.name}, I'm from OmniPost AI. We specialize in helping brands like yours grow on social media. Are you free for a quick chat?`;
        const whatsappUrl = `https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Leads Panel</h1>
                <p className="text-slate-500 mt-1">Discover and connect with potential new brands.</p>
            </div>

            <motion.div
                className="bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by brand name, email, or industry (e.g., 'footwear')..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-slate-500"
                    />
                </div>
            </motion.div>

            <motion.div 
                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-slate-300/70">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300/50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-12 text-slate-500">Loading leads...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-12 text-slate-500">No leads found matching your criteria.</td></tr>
                            ) : (
                                filteredLeads.map(lead => (
                                    <tr key={lead.id} className="hover:bg-white/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.mobileNumber || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.address || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            <button 
                                                onClick={() => handleWhatsAppContact(lead)}
                                                disabled={!lead.mobileNumber}
                                                className="flex items-center px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-500/10 rounded-full hover:bg-green-500/20 disabled:bg-slate-500/10 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            >
                                                <MessageSquare size={14} className="mr-1.5"/>
                                                Contact via WhatsApp
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LeadsPanel;

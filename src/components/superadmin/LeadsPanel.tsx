'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, LoaderCircle } from 'lucide-react';
import { findLeads, type Lead } from '@/ai/flows/ai-lead-generation';
import { useToast } from '@/hooks/use-toast';

const LeadsPanel = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast({
                variant: "destructive",
                title: "Search query is empty",
                description: "Please enter a topic to search for leads.",
            });
            return;
        }
        setIsLoading(true);
        setLeads([]);
        try {
            const result = await findLeads({ query: searchTerm });
            setLeads(result.leads);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "AI Error",
                description: error.message || "Failed to find leads. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleWhatsAppContact = (lead: Lead) => {
        const mobile = lead.mobileNumber;
        if (!mobile) {
            alert('Mobile number not available for this lead.');
            return;
        }
        const message = `Hello ${lead.name}, I'm from OmniPost AI. We specialize in helping brands like yours grow on social media. Are you free for a quick chat?`;
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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">AI Lead Generation</h1>
                <p className="text-slate-500 mt-1">Discover new brands by searching topics like "top 10 footwear brands in India".</p>
            </div>

            <motion.div
                className="bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find new leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-slate-500"
                        />
                    </div>
                    <button onClick={handleSearch} disabled={isLoading} className="px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 shadow-md">
                        {isLoading ? <LoaderCircle className="animate-spin" /> : 'Search'}
                    </button>
                </div>
            </motion.div>

            {isLoading && (
                 <div className="text-center p-12">
                    <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-indigo-600"/>
                    <p className="mt-4 text-slate-600 font-medium">AI is searching for leads...</p>
                 </div>
            )}

            {leads.length > 0 && (
                 <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, staggerChildren: 0.1 }}
                >
                    {leads.map((lead, index) => (
                         <motion.div 
                            key={index}
                            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6 flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex-grow">
                                <h3 className="font-bold text-slate-900 text-lg">{lead.name}</h3>
                                <p className="text-sm text-slate-600 mt-2 mb-4">{lead.description}</p>
                            </div>
                            <div className="space-y-2 text-sm border-t border-slate-300/50 pt-4">
                                <p><strong>Email:</strong> {lead.email}</p>
                                <p><strong>Mobile:</strong> {lead.mobileNumber}</p>
                                <p><strong>Address:</strong> {lead.address}</p>
                            </div>
                            <button 
                                onClick={() => handleWhatsAppContact(lead)}
                                disabled={!lead.mobileNumber}
                                className="w-full mt-4 flex items-center justify-center px-3 py-2 text-sm font-semibold text-green-700 bg-green-500/10 rounded-lg hover:bg-green-500/20 disabled:bg-slate-500/10 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                <MessageSquare size={14} className="mr-1.5"/>
                                Contact via WhatsApp
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}

        </motion.div>
    );
};

export default LeadsPanel;

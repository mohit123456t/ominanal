'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, LoaderCircle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const NewCampaignForm = ({ onCampaignCreated, onCancel }: { onCampaignCreated: () => void; onCancel: () => void; }) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        brandName: '',
        description: '',
        budget: '',
        expectedReels: '',
        deadline: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) {
            toast({ variant: 'destructive', title: "Error", description: "Database not connected." });
            return;
        }
        setLoading(true);
        try {
            const campaignsCollection = collection(firestore, 'campaigns');
            const newCampaign = {
                ...formData,
                budget: parseFloat(formData.budget),
                expectedReels: parseInt(formData.expectedReels),
                status: 'Pending Approval',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            
            await addDoc(campaignsCollection, newCampaign);

            toast({ title: "Success!", description: "Campaign created and is pending approval." });
            onCampaignCreated();

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: `Failed to create campaign: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-slate-500";

    return (
        <motion.div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col border border-slate-300/70"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
            >
                <div className="p-6 border-b border-slate-300/70 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">Create New Campaign</h2>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-500/10 transition-colors">
                        <X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Campaign Name *</label>
                            <input
                                type="text" name="name" value={formData.name} onChange={handleChange} required
                                className={inputStyle} placeholder="e.g., Diwali Sale Launch"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Brand Name *</label>
                            <input
                                type="text" name="brandName" value={formData.brandName} onChange={handleChange} required
                                className={inputStyle} placeholder="e.g., Creative Co."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Campaign Description *</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange} required rows={3}
                                className={inputStyle} placeholder="Describe the campaign objectives..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Budget (₹) *</label>
                            <input
                                type="number" name="budget" value={formData.budget} onChange={handleChange} required min="0"
                                className={inputStyle} placeholder="e.g., 50000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Reels *</label>
                            <input
                                type="number" name="expectedReels" value={formData.expectedReels} onChange={handleChange} required min="1"
                                className={inputStyle} placeholder="e.g., 10"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Deadline *</label>
                            <input
                                type="date" name="deadline" value={formData.deadline} onChange={handleChange} required
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-slate-300/70">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 font-medium text-slate-700 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-colors disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {loading ? <LoaderCircle className="animate-spin mr-2"/> : null}
                            {loading ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default NewCampaignForm;

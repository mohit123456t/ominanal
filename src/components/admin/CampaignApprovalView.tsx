'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import CampaignAssignmentView from './CampaignAssignmentView';
import { useToast } from '@/hooks/use-toast';

const CampaignApprovalView = ({ campaigns: initialCampaigns }: { campaigns: any[] }) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [campaigns, setCampaigns] = useState(() => initialCampaigns.filter(c => c.status === 'Pending Approval'));
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'assign'

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Error", description: "Database not available." });
            return;
        }

        const campaignRef = doc(firestore, "campaigns", id);
        try {
            await updateDoc(campaignRef, { status: newStatus });
            setCampaigns(prev => prev.filter(c => c.id !== id));
            toast({ title: "Success", description: `Campaign has been ${newStatus}.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: `Failed to update status: ${error.message}` });
        }
    };
    
    const openAssignmentView = (campaign: any) => {
        setSelectedCampaign(campaign);
        setViewMode('assign');
    };

    const closeViews = () => {
        setSelectedCampaign(null);
        setViewMode('list');
    };

    return (
        <div className="p-1">
            <AnimatePresence>
                {viewMode === 'list' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <h2 className="text-2xl font-bold text-slate-800 mb-6">Campaign Approval Queue</h2>
                         {campaigns.length > 0 ? (
                            <div className="space-y-4">
                                {campaigns.map(campaign => (
                                    <motion.div 
                                        key={campaign.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white/60 p-5 rounded-xl border border-white/40 shadow-sm flex items-center justify-between"
                                    >
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{campaign.name}</h3>
                                            <p className="text-sm text-slate-600">Budget: ₹{campaign.budget?.toLocaleString() || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleUpdateStatus(campaign.id, 'Rejected')} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100/70 hover:bg-red-200/70 rounded-lg">Reject</button>
                                            <button onClick={() => handleUpdateStatus(campaign.id, 'Approved')} className="px-4 py-2 text-sm font-semibold text-green-600 bg-green-100/70 hover:bg-green-200/70 rounded-lg">Approve</button>
                                            <button onClick={() => openAssignmentView(campaign)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md">Review & Assign</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-10">No pending campaigns to review.</p>
                        )}
                    </motion.div>
                )}

                {viewMode === 'assign' && selectedCampaign && (
                    <CampaignAssignmentView 
                        campaignId={selectedCampaign.id} 
                        onClose={closeViews} 
                    />
                )}

            </AnimatePresence>
        </div>
    );
};

export default CampaignApprovalView;

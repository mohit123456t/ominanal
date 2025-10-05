'use client';

import React from 'react';
import { X, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CampaignDetailView = ({ campaign, onClose, onCreateOrder }: { campaign: any, onClose: () => void, onCreateOrder: () => void }) => {
    if (!campaign) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white/50 p-8 rounded-2xl text-slate-800">
                    <p>No campaign selected.</p>
                    <Button onClick={onClose} className="mt-4">Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-300/70">
                <header className="p-6 border-b border-slate-300/70 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{campaign.name || 'Campaign Details'}</h2>
                        <p className="text-sm text-slate-500">Overview of your campaign.</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </header>
                <main className="p-6 overflow-y-auto space-y-4">
                    <div className="p-4 bg-white/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800">Campaign Brief</h3>
                        <p className="text-sm text-slate-600 mt-2">{campaign.description || 'No description available.'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 bg-white/30 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                            <div>
                                <p className="text-sm text-slate-500">Budget</p>
                                <p className="font-semibold text-slate-800">₹{campaign.budget?.toLocaleString() || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/30 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600" />
                            <div>
                                <p className="text-sm text-slate-500">Deadline</p>
                                <p className="font-semibold text-slate-800">{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                     <p className="text-center text-slate-400 text-sm pt-4">More details coming soon.</p>
                </main>
                 <footer className="p-4 border-t border-slate-300/70 mt-auto">
                    <Button onClick={onCreateOrder} className="w-full">Create New Order</Button>
                </footer>
            </div>
        </div>
    );
};

export default CampaignDetailView;

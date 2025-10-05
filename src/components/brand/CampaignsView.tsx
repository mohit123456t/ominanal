'use client';

import React from 'react';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CampaignsView = ({ campaigns, onSelectCampaign, onNewCampaign, onCreateOrder }: { campaigns: any[], onSelectCampaign: (campaign: any) => void, onNewCampaign: () => void, onCreateOrder: (campaign: any) => void }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Your Campaigns</h2>
                <Button onClick={onNewCampaign}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                </Button>
            </div>
            {campaigns && campaigns.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg p-6">
                            <h3 className="font-bold text-lg text-slate-800">{campaign.name}</h3>
                            <p className="text-sm text-slate-500">Status: {campaign.status}</p>
                            <p className="text-sm text-slate-500 mt-2">Budget: ₹{campaign.budget?.toLocaleString()}</p>
                            <div className="mt-4 flex gap-2">
                                <Button size="sm" onClick={() => onSelectCampaign(campaign)}>View Details</Button>
                                <Button size="sm" variant="outline" onClick={() => onCreateOrder(campaign)}>New Order</Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg p-12 text-center">
                    <Folder className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-bold text-slate-800">No Campaigns Found</h2>
                    <p className="text-slate-500 mt-2">Get started by creating your first campaign.</p>
                </div>
            )}
        </div>
    );
};

export default CampaignsView;

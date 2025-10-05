'use client';
import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// StatusBadge component - Themed
const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: Record<string, { bg: string, text: string }> = {
        "Active": { bg: 'bg-green-500/20', text: 'text-green-800' },
        "Completed": { bg: 'bg-slate-500/20', text: 'text-slate-800' },
        "Paused": { bg: 'bg-yellow-500/20', text: 'text-yellow-800' },
        "Rejected": { bg: 'bg-red-500/20', text: 'text-red-800' },
        "Pending Approval": { bg: 'bg-blue-500/20', text: 'text-blue-800' },
    };
    const style = statusStyles[status] || { bg: 'bg-gray-500/20', text: 'text-gray-800' };
    const baseClasses = "text-xs font-semibold px-3 py-1 rounded-full inline-block";

    return <span className={`${baseClasses} ${style.bg} ${style.text}`}>{status}</span>;
};


// CampaignCard Component — Themed for Glassmorphism
const CampaignCard = ({ campaign, onSelectCampaign, onCreateOrder }: { campaign: any, onSelectCampaign: (campaign: any) => void, onCreateOrder: (campaign: any) => void }) => {
    const handleSelect = () => onSelectCampaign && onSelectCampaign(campaign);
    const handleCreateOrder = () => onCreateOrder && onCreateOrder(campaign);

    const engagementRate = campaign.engagementRate || '0.00%';
    const lastUpdated = campaign.lastUpdated ? new Date(campaign.lastUpdated).toLocaleDateString() : 'N/A';
    const reelsCount = campaign.reels || 0;
    const views = (campaign.views || 0).toLocaleString();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300/70 p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col"
        >
            <div className="flex-grow">
                {/* Campaign Name & Status */}
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                    <StatusBadge status={campaign.status} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 text-sm">
                    <div className="bg-black/5 p-3 rounded-lg">
                        <div className="text-slate-700">Reels</div>
                        <div className="font-semibold text-slate-900 text-base">{reelsCount}</div>
                    </div>
                    <div className="bg-black/5 p-3 rounded-lg">
                        <div className="text-slate-700">Total Views</div>
                        <div className="font-semibold text-slate-900 text-base">{views}</div>
                    </div>
                    <div className="bg-black/5 p-3 rounded-lg">
                        <div className="text-slate-700">Engagement</div>
                        <div className="font-semibold text-slate-900 text-base">{engagementRate}</div>
                    </div>
                    <div className="bg-black/5 p-3 rounded-lg col-span-2 md:col-span-3">
                        <div className="text-slate-700">Last Updated</div>
                        <div className="font-semibold text-slate-900 text-base">{lastUpdated}</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4 border-t border-slate-300/70 pt-4">
                <button
                    onClick={handleSelect}
                    className="text-blue-700 font-semibold hover:underline text-sm"
                >
                    View Details
                </button>
                <button
                    onClick={handleCreateOrder}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition-colors shadow-sm"
                >
                    Add Order
                </button>
            </div>
        </motion.div>
    );
};

// Main CampaignsView Component — Layout
const CampaignsView = ({ campaigns = [], onSelectCampaign, onNewCampaign, onCreateOrder }: { campaigns: any[], onSelectCampaign: (campaign: any) => void, onNewCampaign: () => void, onCreateOrder: (campaign: any) => void }) => {
    const handleNewCampaign = () => {
        if (onNewCampaign) {
            onNewCampaign();
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Your Campaigns</h1>
                <button
                    onClick={handleNewCampaign}
                    className="flex items-center bg-slate-900 text-white font-semibold py-2 px-5 rounded-lg text-sm hover:bg-slate-800 transition-colors shadow-md"
                >
                    <span className="mr-2"><Plus /></span>
                    New Campaign
                </button>
            </div>

            {/* No Campaigns Message - Themed */}
            {campaigns.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300/70 p-12 text-center">
                    <p className="text-slate-700 text-lg mb-2">No campaigns found.</p>
                    <p className="text-slate-600">Ready to start? Create your first campaign now.</p>
                    <button
                        onClick={handleNewCampaign}
                        className="mt-6 bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg text-sm hover:bg-slate-900 transition-colors"
                    >
                        Create Campaign
                    </button>
                </div>
            ) : (
                /* Campaign Cards Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => (
                        <CampaignCard
                            key={`${campaign.id}-${index}`}
                            campaign={campaign}
                            onSelectCampaign={onSelectCampaign}
                            onCreateOrder={onCreateOrder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignsView;
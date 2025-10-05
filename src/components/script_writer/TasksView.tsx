'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'lucide-react';


const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses: { [key: string]: string } = {
        "Active": "bg-green-100 text-green-800",
        "Completed": "bg-slate-200 text-slate-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const CampaignDetailsModal = ({ campaign, onClose }: { campaign: any, onClose: () => void }) => {
    if (!campaign) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Campaign Details: {campaign.name}</h2>
                    <button onClick={onClose}><XCircle /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {/* Display campaign details here */}
                    <p>Campaign details will be displayed here.</p>
                </div>
            </div>
        </div>
    );
};

const TasksView = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        // Placeholder data
        const placeholderCampaigns = [
            { id: 'camp1', name: 'Summer Kick-off', brandName: 'CoolBrand', status: 'Active', deadline: new Date().toISOString() },
            { id: 'camp2', name: 'Winter Fest', brandName: 'WarmWears', status: 'Completed', deadline: new Date().toISOString() },
        ];
        setCampaigns(placeholderCampaigns);
        setLoading(false);
    }, []);
    
    const handleOpenModal = (campaign: any) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
            <div className="p-4 border-b">
                 <h3 className="font-bold text-lg text-slate-800 mb-2">Assigned Campaigns</h3>
            </div>
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">⏳</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Campaigns...</h3>
                        <p className="text-slate-600">Please wait while we fetch your assigned campaigns</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No campaigns assigned</h3>
                        <p className="text-slate-600">You have no active campaigns assigned.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-slate-800">{campaign.name}</h4>
                                    <StatusBadge status={campaign.status} />
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{campaign.brandName}</p>
                                <p className="text-xs text-slate-500 mb-2">Deadline: {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline'}</p>
                                <button onClick={() => handleOpenModal(campaign)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isModalOpen && <CampaignDetailsModal campaign={selectedCampaign} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default TasksView;

'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

// Themed StatusBadge
const StatusBadge = ({ status }: { status: string }) => {
    const statusInfo: Record<string, { text: string, classes: string }> = {
        "Active": { text: "Active", classes: "bg-green-500/20 text-green-800" },
        "Completed": { text: "Completed", classes: "bg-slate-500/20 text-slate-800" },
        "Paused": { text: "Paused", classes: "bg-yellow-500/20 text-yellow-800" },
        "Pending Approval": { text: "Pending Approval", classes: "bg-orange-500/20 text-orange-800" },
        "Rejected": { text: "Rejected", classes: "bg-red-500/20 text-red-800" },
        "Draft": { text: "Draft", classes: "bg-blue-500/20 text-blue-800" },
    };
    const currentStatus = statusInfo[status] || { text: status, classes: "bg-gray-500/20 text-gray-800" };

    return (
        <span className={`inline-flex items-center text-sm font-semibold px-4 py-2 rounded-full ${currentStatus.classes}`}>
            {currentStatus.text}
        </span>
    );
};

// Themed Alert Components
const RejectedAlert = ({ rejectionReason }: { rejectionReason?: string }) => (
    <div className="p-4 mb-6 bg-red-500/10 backdrop-blur-lg border border-red-500/30 rounded-2xl">
        <div className="flex items-center">
            <div className="text-red-500 mr-3 text-xl">❌</div>
            <div>
                <h4 className="font-bold text-red-800">Campaign Rejected</h4>
                <p className="text-red-700 text-sm">
                    {rejectionReason || "This campaign did not meet our guidelines and has been rejected by the admin."}
                </p>
            </div>
        </div>
    </div>
);

const PendingView = () => (
    <div className="p-4 mb-6 bg-orange-500/10 backdrop-blur-lg border border-orange-500/30 rounded-2xl">
        <div className="flex items-center">
            <div className="text-orange-500 mr-3 text-xl">⏰</div>
            <div>
                <h4 className="font-bold text-orange-800">Awaiting Approval</h4>
                <p className="text-orange-700 text-sm">
                    This campaign is currently under review by our team. You will be notified once it is approved.
                </p>
            </div>
        </div>
    </div>
);

// Themed Analytics Insights Card
const AnalyticsInsights = ({ totalReels, totalViews, totalReach, expectedReels }: { totalReels: number, totalViews: number, totalReach: number, expectedReels: number }) => {
    const completionRate = expectedReels ? ((totalReels / expectedReels) * 100).toFixed(1) : 0;
    const avgViewsPerReel = totalReels ? (totalViews / totalReels).toFixed(0).toLocaleString() : 0;

    return (
        <div className="bg-blue-100/40 backdrop-blur-xl p-6 rounded-2xl border border-blue-300/70 shadow-lg">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center text-lg">
                📊 Analytics Insights
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
                <li>✅ <strong>Completion Rate:</strong> {completionRate}% ({totalReels}/{expectedReels} reels)</li>
                <li>👁️ <strong>Avg. Views per Reel:</strong> {avgViewsPerReel}</li>
                <li>📈 <strong>Total Reach:</strong> {totalReach.toLocaleString()}</li>
                {totalViews > totalReach && (
                    <li className="font-semibold text-amber-800 mt-2 p-2 bg-amber-500/20 rounded-md">⚠️ Views exceed Reach — possible bot activity or repeated views.</li>
                )}
                {parseFloat(completionRate as string) < 50 && (
                    <li className="font-semibold text-red-800 mt-2 p-2 bg-red-500/20 rounded-md">📉 Low completion rate — consider boosting creator incentives.</li>
                )}
            </ul>
        </div>
    );
};

// Main Component
const CampaignDetailView = ({ campaignId, onClose, onCreateOrder }: { campaignId: string, onClose: () => void, onCreateOrder: (campaign: any) => void }) => {
    const { user, firestore } = useFirebase();

    // Directly fetch the user document which contains the campaigns array
    const userDocRef = useMemoFirebase(() => {
        if (user && firestore) {
            return doc(firestore, 'users', user.uid);
        }
        return null;
    }, [user, firestore]);

    const { data: userData, isLoading: loading, error } = useDoc<any>(userDocRef);

    // Find the specific campaign from the user's campaigns array
    const campaign = useMemo(() => {
        if (userData && userData.campaigns) {
            return userData.campaigns.find((c: any) => c.id === campaignId);
        }
        return null;
    }, [userData, campaignId]);

    const reels = useMemo(() => campaign?.reels || [], [campaign]);
    const totalReels = reels.length;
    const totalViews = reels.reduce((sum: number, r: any) => sum + (r.views || 0), 0);
    const totalReach = reels.reduce((sum: number, r: any) => sum + (r.reach || 0), 0);
    
    const engagementData = [
        { day: 'Day 1', engagement: 120 }, { day: 'Day 2', engagement: 180 },
        { day: 'Day 3', engagement: 220 }, { day: 'Day 4', engagement: 190 },
        { day: 'Day 5', engagement: 250 }, { day: 'Day 6', engagement: 300 },
        { day: 'Day 7', engagement: 280 },
    ];
    
    if (loading) return <div className="p-8 text-center text-slate-700">Loading campaign details...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Error: {error.message}</div>;

    if (!campaign) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-xl font-semibold text-red-600">Campaign Not Found</h3>
                <p className="text-slate-600 mt-2">It might have been deleted or moved.</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200/50 rounded-lg hover:bg-slate-300/50 transition">
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">{campaign.name}</h1>
                    <p className="text-slate-600 mt-1">Detailed performance & analytics</p>
                </div>
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-700 hover:text-slate-900 bg-white/30 hover:bg-white/50 rounded-lg transition"
                >
                    ← Back
                </button>
            </div>

            {/* Status Banner */}
            <div className="mb-8 flex justify-center">
                <StatusBadge status={campaign.status} />
            </div>

            {/* Conditional Alerts */}
            {campaign.status === 'Rejected' && <RejectedAlert rejectionReason={campaign.rejectionReason} />}
            {campaign.status === 'Pending Approval' && <PendingView />}

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-slate-300/70 text-center">
                    <div className="text-3xl font-bold text-blue-700">{totalReels}</div>
                    <div className="text-sm text-slate-700 mt-1">Total Reels Uploaded</div>
                </div>
                <div className="bg-white/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-slate-300/70 text-center">
                    <div className="text-3xl font-bold text-green-700">{totalViews.toLocaleString()}</div>
                    <div className="text-sm text-slate-700 mt-1">Total Views</div>
                </div>
                <div className="bg-white/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-slate-300/70 text-center">
                    <div className="text-3xl font-bold text-purple-700">{totalReach.toLocaleString()}</div>
                    <div className="text-sm text-slate-700 mt-1">Total Reach</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info + Description */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-300/70">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">📋 Campaign Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div className="text-slate-800"><strong>Brand:</strong> {userData?.brandName || 'N/A'}</div>
                            <div className="text-slate-800"><strong>Budget:</strong> ₹{campaign.budget?.toLocaleString()}</div>
                            <div className="text-slate-800"><strong>Target Reels:</strong> {campaign.expectedReels}</div>
                            <div className="text-slate-800"><strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-300/70">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">📝 Description</h3>
                        <p className="text-slate-700 leading-relaxed">
                            {campaign.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Analytics + Chart */}
                <div className="space-y-6">
                    <AnalyticsInsights
                        totalReels={totalReels} totalViews={totalViews}
                        totalReach={totalReach} expectedReels={campaign.expectedReels}
                    />
                    <div className="bg-white/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-slate-300/70">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">📈 Weekly Engagement</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={engagementData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="day" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip wrapperClassName="!bg-white/80 !backdrop-blur-sm !border-slate-300/70 !rounded-lg" />
                                    <Bar dataKey="engagement" fill="#4338CA" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-slate-300/70 flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 font-semibold text-slate-800 bg-white/40 hover:bg-white/60 rounded-lg transition"
                >
                    Close
                </button>
                {campaign.status === 'Active' && (
                    <button
                        onClick={() => onCreateOrder(campaign)}
                        className="px-6 py-2.5 font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-md flex items-center space-x-2 transition"
                    >
                        <span>+</span>
                        <span>Add New Order</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CampaignDetailView;

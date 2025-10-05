'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// A consistent, themed status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: Record<string, { bg: string, text: string }> = {
        "Active": { bg: 'bg-green-500/20', text: 'text-green-800' },
        "Completed": { bg: 'bg-slate-500/20', text: 'text-slate-800' },
        "Paused": { bg: 'bg-yellow-500/20', text: 'text-yellow-800' },
        "Pending Approval": { bg: 'bg-orange-500/20', text: 'text-orange-800' },
    };
    const style = statusStyles[status] || { bg: 'bg-gray-500/20', text: 'text-gray-800' };
    const baseClasses = "text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block";

    return <span className={`${baseClasses} ${style.bg} ${style.text}`}>{status}</span>;
};

const AnalyticsView = ({ campaigns = [] }: { campaigns: any[] }) => {
    // Process data for the chart
    const chartData = useMemo(() => campaigns.map(campaign => {
        const totalLikes = campaign.reels ? campaign.reels.reduce((sum: number, reel: any) => sum + (reel.likes || 0), 0) : 0;
        const totalComments = campaign.reels ? campaign.reels.reduce((sum: number, reel: any) => sum + (reel.comments || 0), 0) : 0;
        const totalEngagement = totalLikes + totalComments;

        return {
            name: campaign.name.length > 15 ? `${campaign.name.substring(0, 15)}...` : campaign.name,
            views: campaign.views || 0,
            engagement: totalEngagement,
        };
    }), [campaigns]);

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Campaign Analytics</h1>

            {/* Chart Card */}
            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-300/70 mb-8">
                <h3 className="font-bold text-xl mb-4 text-slate-800">Performance Comparison</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                                wrapperClassName="!bg-white/60 !backdrop-blur-sm !border-slate-300/70 !rounded-lg !shadow-lg"
                            />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Bar dataKey="views" fill="#4338CA" name="Total Views" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="engagement" fill="#818CF8" name="Total Engagement" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-300/70">
                <h3 className="font-bold text-xl mb-4 text-slate-800">Detailed Campaign Metrics</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-700">
                        <thead className="text-xs text-slate-800 uppercase bg-black/5">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Campaign Name</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Total Views</th>
                                <th scope="col" className="px-6 py-3">Reels Uploaded</th>
                                <th scope="col" className="px-6 py-3">Total Engagement</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-600">
                                        <p className="font-semibold">No campaign data available</p>
                                        <p className="text-xs mt-1">Create new campaigns to start seeing your analytics.</p>
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign, index) => {
                                    const totalEngagement = Array.isArray(campaign.reels) ? campaign.reels.reduce((sum: number, reel: any) => sum + (reel.likes || 0) + (reel.comments || 0), 0) : 0;
                                    const lastUpdated = Array.isArray(campaign.reels) && campaign.reels.length > 0 ?
                                        new Date(Math.max(...campaign.reels.map((r: any) => new Date(r.uploadedAt || 0).getTime()))).toLocaleDateString() : 'N/A';
                                    return (
                                        <tr key={`campaign-${index}`} className="border-b border-slate-300/70">
                                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{campaign.name}</th>
                                            <td className="px-6 py-4"><StatusBadge status={campaign.status} /></td>
                                            <td className="px-6 py-4">{(campaign.views || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4">{campaign.expectedReels || 0}</td>
                                            <td className="px-6 py-4">{totalEngagement.toLocaleString()}</td>
                                            <td className="px-6 py-4">{lastUpdated}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;

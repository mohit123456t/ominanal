'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Folder, Eye, Sparkles, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

// Animated Counter Component
const AnimatedNumber = ({ value, duration = 1000 }: { value: number; duration?: number; }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = value || 0;
        if (end === 0) {
            setDisplayValue(0);
            return;
        }
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{displayValue.toLocaleString()}</span>;
};

// Card Component
const Card = ({ title, value, change = null, icon, subtitle = null, delay = 0 }: { title: string; value: string | number; change?: string | null; icon: React.ReactNode; subtitle?: string | null; delay?: number; }) => (
    <motion.div 
        className="bg-white/40 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-300/70"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000 }}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                    {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
                </p>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className="text-slate-500 text-xl sm:text-2xl p-2 rounded-lg bg-white/50">{icon}</div>
        </div>
        {change && <p className="text-xs text-slate-500 mt-2">{change}</p>}
    </motion.div>
);

const DashboardView = ({ campaigns = [], profile, onNewCampaign, onNavigateToAnalytics, onNavigateToCampaigns }: { campaigns: any[], profile: any, onNewCampaign: () => void, onNavigateToAnalytics: () => void, onNavigateToCampaigns: () => void }) => {
    
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;
    const completedCampaigns = campaigns.filter((c) => c.status === 'Completed').length;
    const pendingCampaigns = campaigns.filter((c) => c.status === 'Paused' || c.status === 'Pending').length;
    const totalViews = campaigns.reduce((sum, campaign) => sum + (campaign.views || 0), 0);
    const totalReels = campaigns.reduce((sum, campaign) => sum + (campaign.reelsCount || 0), 0);
    const uploadedReels = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.filter((r: any) => r.status === 'Live').length : 0), 0);
    const pendingReels = totalReels - uploadedReels;
    const totalLikes = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.likes || 0), 0) : 0), 0);
    const totalComments = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.comments || 0), 0) : 0), 0);
    const totalShares = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.shares || 0), 0) : 0), 0);
    const totalSaves = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.saves || 0), 0) : 0), 0);
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares + totalSaves) / totalViews * 100).toFixed(1) : 0;
    const promisedViews = totalCampaigns * 50000;
    const viewsProgress = promisedViews > 0 ? (totalViews / promisedViews * 100).toFixed(1) : 0;
    const engagementBreakdown = [
        { name: 'Likes', value: totalLikes, color: '#10b981' },
        { name: 'Comments', value: totalComments, color: '#3b82f6' },
        { name: 'Shares', value: totalShares, color: '#f59e0b' },
        { name: 'Saves', value: totalSaves, color: '#ef4444' },
    ].filter((item) => item.value > 0);
    const campaignStatusData = [
        { name: 'Active', value: activeCampaigns, color: 'text-green-600', bgColor: 'from-green-500 to-green-600' },
        { name: 'Completed', value: completedCampaigns, color: 'text-blue-600', bgColor: 'from-blue-500 to-blue-600' },
        { name: 'Pending', value: pendingCampaigns, color: 'text-yellow-600', bgColor: 'from-yellow-500 to-yellow-600' },
    ];
    const performanceData = [
        { period: 'Mon', views: 12000, engagement: 480 },
        { period: 'Tue', views: 15000, engagement: 600 },
        { period: 'Wed', views: 18000, engagement: 720 },
        { period: 'Thu', views: 14000, engagement: 560 },
        { period: 'Fri', views: 22000, engagement: 880 },
        { period: 'Sat', views: 25000, engagement: 1000 },
        { period: 'Sun', views: 20000, engagement: 800 },
    ];


    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/70 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-300/50">
                    <p className="font-medium text-slate-800">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Campaign Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time insights for your marketing success</p>
                    {profile && profile.name && (
                        <p className="text-green-600 mt-2 font-medium">👋 Welcome back, {profile.name}!</p>
                    )}
                </div>
                {profile && profile.name && (
                    <motion.div 
                        className="mt-4 sm:mt-0 bg-white/40 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-slate-300/70"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">{profile.name}</p>
                                <p className="text-sm text-slate-600">{profile.brandName || 'Brand'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Campaigns" value={totalCampaigns} subtitle={`${activeCampaigns} Active`} icon={<Folder />} delay={100} />
                <Card title="Views Generated" value={totalViews} subtitle={`${viewsProgress}% goal`} icon={<Eye />} delay={200} />
                <Card title="Engagement Rate" value={`${engagementRate}%`} subtitle={`${(totalLikes + totalComments + totalShares + totalSaves).toLocaleString()} eng.`} icon={<Sparkles />} delay={300} />
                <Card title="Reel Upload" value={`${uploadedReels}/${totalReels}`} subtitle={`${pendingReels} left`} icon={<Upload />} delay={400} />
            </div>

            <motion.div 
                className="bg-white/40 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-300/70"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-lg mb-4 text-slate-800">📊 Engagement Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Placeholder for engagement stats */}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Placeholder for charts */}
            </div>

            <motion.div 
                className="bg-white/40 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-300/70"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            >
                <h3 className="font-bold text-lg mb-4 text-slate-800">🎯 Campaign Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {campaignStatusData.map((status, index) => (
                        <div key={index} className="text-center">
                            <div className="relative w-28 h-28 mx-auto mb-3">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${status.bgColor} opacity-20`}></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-800">
                                        <AnimatedNumber value={status.value} />
                                    </span>
                                </div>
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#e2e8f0"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={`${(status.value / Math.max(totalCampaigns, 1)) * 283}, 283`}
                                        className={`${status.color} text-opacity-80`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-slate-600">{status.name}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardView;
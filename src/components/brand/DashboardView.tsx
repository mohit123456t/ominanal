'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
    
    const stats = useMemo(() => {
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;
        const totalViews = campaigns.reduce((sum, campaign) => sum + (campaign.views || 0), 0);
        const totalReels = campaigns.reduce((sum, campaign) => sum + (campaign.expectedReels || 0), 0);
        const uploadedReels = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.length : 0), 0);
        const totalLikes = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.likes || 0), 0) : 0), 0);
        const totalComments = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.comments || 0), 0) : 0), 0);
        const totalShares = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.shares || 0), 0) : 0), 0);
        const totalSaves = campaigns.reduce((sum, campaign) => sum + (Array.isArray(campaign.reels) ? campaign.reels.reduce((rSum, reel: any) => rSum + (reel.saves || 0), 0) : 0), 0);
        const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares + totalSaves) / totalViews * 100).toFixed(1) : 0;
        
        return {
            totalCampaigns,
            activeCampaigns,
            totalViews,
            totalReels,
            uploadedReels,
            engagementRate,
            totalLikes,
            totalComments,
            totalShares,
            totalSaves
        };
    }, [campaigns]);

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
                <Card title="Total Campaigns" value={stats.totalCampaigns} subtitle={`${stats.activeCampaigns} Active`} icon={<Folder />} delay={100} />
                <Card title="Views Generated" value={stats.totalViews} subtitle="Across all campaigns" icon={<Eye />} delay={200} />
                <Card title="Engagement Rate" value={`${stats.engagementRate}%`} subtitle="Avg. engagement" icon={<Sparkles />} delay={300} />
                <Card title="Reel Upload" value={`${stats.uploadedReels}/${stats.totalReels}`} subtitle={`${stats.totalReels - stats.uploadedReels} left`} icon={<Upload />} delay={400} />
            </div>
        </motion.div>
    );
};

export default DashboardView;

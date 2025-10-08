
'use client';
import React from 'react';
import {
  Briefcase,
  PlayCircle,
  Rocket,
  Clock,
  CheckCircle,
  Users,
  IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';

const formatNumber = (value: number) => {
    if (!value) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
};

const StatCard = ({ title, value, icon, colorClass, delay = 0 }: { title: string, value: string, icon: React.ReactNode, colorClass: string, delay?: number }) => (
    <motion.div
      className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-300/50 flex items-center space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className={`p-4 rounded-xl ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );

const SuperAdminDashboard = ({ users }: { users: any[] }) => {
    
    const brands = users.filter(u => u.role === 'brand');
    const totalBrands = brands.length;

    // This data is no longer available due to security constraints.
    // We will show placeholders or remove these stats.
    const totalCampaigns = 0;
    const liveCampaigns = 0;
    const pendingCampaigns = 0;
    const activeCampaigns = 0;
    const brandsWithLiveCampaigns = 0;
    const brandsWithoutCampaigns = totalBrands;
    const totalCampaignEarnings = 0;

    const safeFormat = (value: number) => formatNumber(value || 0);
  
    return (
      <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
      >
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Super Admin Dashboard</h1>
          <p className="text-md text-slate-500 mt-1">Comprehensive overview of all platform activities.</p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Brands" value={safeFormat(totalBrands)}
            icon={<Briefcase className="text-blue-600"/>} colorClass="bg-blue-100" delay={0.1}
          />
          <StatCard
            title="Active Campaigns" value={safeFormat(activeCampaigns)}
            icon={<PlayCircle className="text-green-600"/>} colorClass="bg-green-100" delay={0.2}
          />
          <StatCard
            title="Live Campaigns" value={safeFormat(liveCampaigns)}
            icon={<Rocket className="text-purple-600"/>} colorClass="bg-purple-100" delay={0.3}
          />
          <StatCard
            title="Pending Campaigns" value={safeFormat(pendingCampaigns)}
            icon={<Clock className="text-orange-600"/>} colorClass="bg-orange-100" delay={0.4}
          />
          <StatCard
            title="Brands with Live Campaigns" value={safeFormat(brandsWithLiveCampaigns)}
            icon={<CheckCircle className="text-teal-600"/>} colorClass="bg-teal-100" delay={0.5}
          />
           <StatCard
            title="Brands without Campaigns" value={safeFormat(brandsWithoutCampaigns)}
            icon={<Users className="text-yellow-600"/>} colorClass="bg-yellow-100" delay={0.6}
          />
           <StatCard
            title="Total Campaign Earnings" value={`₹${safeFormat(totalCampaignEarnings)}`}
            icon={<IndianRupee className="text-pink-600"/>} colorClass="bg-pink-100" delay={0.7}
          />
        </div>
      </motion.div>
    );
};

export default SuperAdminDashboard;

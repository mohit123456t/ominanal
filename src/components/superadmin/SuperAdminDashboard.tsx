
'use client';
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

const StatCard = ({ title, value, icon, color, size = 'normal' }: { title: string, value: string, icon: React.ReactNode, color: string, size?: 'normal' | 'large' }) => (
  <motion.div
    className={`bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 
    ${size === 'large' ? 'p-6 text-base md:col-span-2' : 'p-4 text-sm'}`}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <div className={`text-xl p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className={`font-bold ${size === 'large' ? 'text-3xl' : 'text-2xl'} text-slate-900 tracking-tight`}>
      {value}
    </p>
  </motion.div>
);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="font-bold text-slate-800">{`Earnings: ₹${formatNumber(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
};
  
const SuperAdminDashboard = ({ data }: { data: any }) => {
    const userCounts = { brands: 1254 };
    const dashboardData = {
      totalActiveCampaigns: 48,
      liveCampaigns: 12,
      pendingCampaigns: 5,
      brandsWithLiveCampaigns: 8,
      brandsWithoutCampaigns: 1246,
      totalCampaignEarnings: 567890,
      campaignEarnings: [
          { name: 'Jan', earnings: 40000 },
          { name: 'Feb', earnings: 30000 },
          { name: 'Mar', earnings: 50000 },
          { name: 'Apr', earnings: 45000 },
          { name: 'May', earnings: 60000 },
          { name: 'Jun', earnings: 75000 },
      ]
    };
  
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
  
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Brands" value={safeFormat(userCounts.brands)}
            icon={<Briefcase />} color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Active Campaigns" value={safeFormat(dashboardData.totalActiveCampaigns)}
            icon={<PlayCircle />} color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Live Campaigns" value={safeFormat(dashboardData.liveCampaigns)}
            icon={<Rocket />} color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Pending Campaigns" value={safeFormat(dashboardData.pendingCampaigns)}
            icon={<Clock />} color="bg-orange-100 text-orange-600"
          />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Brands with Live Campaigns" value={safeFormat(dashboardData.brandsWithLiveCampaigns)}
            icon={<CheckCircle />} color="bg-teal-100 text-teal-600" size="large"
          />
          <StatCard
            title="Brands without Campaigns" value={safeFormat(dashboardData.brandsWithoutCampaigns)}
            icon={<Users />} color="bg-yellow-100 text-yellow-600" size="large"
          />
          <StatCard
            title="Total Campaign Earnings" value={`₹${safeFormat(dashboardData.totalCampaignEarnings)}`}
            icon={<IndianRupee />} color="bg-pink-100 text-pink-600" size="large"
          />
        </div>
  
        <motion.div 
          className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-xl mb-6 text-slate-800">Campaign Earnings Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.campaignEarnings || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickFormatter={(value) => formatNumber(value)}
                  tickLine={false} axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="earnings" fill="#4f46e5" name="Earnings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    );
};

export default SuperAdminDashboard;

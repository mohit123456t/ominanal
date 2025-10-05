
'use client';
import React from 'react';
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

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl p-3 shadow-xl">
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
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Brands" value={safeFormat(userCounts.brands)}
            icon={<Briefcase className="text-blue-600"/>} colorClass="bg-blue-100" delay={0.1}
          />
          <StatCard
            title="Active Campaigns" value={safeFormat(dashboardData.totalActiveCampaigns)}
            icon={<PlayCircle className="text-green-600"/>} colorClass="bg-green-100" delay={0.2}
          />
          <StatCard
            title="Live Campaigns" value={safeFormat(dashboardData.liveCampaigns)}
            icon={<Rocket className="text-purple-600"/>} colorClass="bg-purple-100" delay={0.3}
          />
          <StatCard
            title="Pending Campaigns" value={safeFormat(dashboardData.pendingCampaigns)}
            icon={<Clock className="text-orange-600"/>} colorClass="bg-orange-100" delay={0.4}
          />
          <StatCard
            title="Brands with Live Campaigns" value={safeFormat(dashboardData.brandsWithLiveCampaigns)}
            icon={<CheckCircle className="text-teal-600"/>} colorClass="bg-teal-100" delay={0.5}
          />
           <StatCard
            title="Brands without Campaigns" value={safeFormat(dashboardData.brandsWithoutCampaigns)}
            icon={<Users className="text-yellow-600"/>} colorClass="bg-yellow-100" delay={0.6}
          />
           <StatCard
            title="Total Campaign Earnings" value={`₹${safeFormat(dashboardData.totalCampaignEarnings)}`}
            icon={<IndianRupee className="text-pink-600"/>} colorClass="bg-pink-100" delay={0.7}
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


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
  
const SuperAdminDashboard = ({ users, posts }: { users: any[], posts: any[] }) => {
    
    const brands = users.filter(u => u.role === 'brand');
    const totalBrands = brands.length;

    const totalCampaigns = posts.length;
    const liveCampaigns = posts.filter(p => p.status === 'Published').length;
    const pendingCampaigns = posts.filter(p => p.status === 'Scheduled').length; // Assuming pending means scheduled
    const activeCampaigns = liveCampaigns + pendingCampaigns;

    const brandsWithPosts = new Set(posts.map(p => p.userId));
    const brandsWithLiveCampaigns = brands.filter(b => brandsWithPosts.has(b.id)).length;
    const brandsWithoutCampaigns = totalBrands - brandsWithLiveCampaigns;
    
    const totalCampaignEarnings = posts.reduce((sum, post) => sum + (post.budget || 0), 0);

    const campaignEarningsByMonth = posts.reduce((acc, post) => {
        if (!post.createdAt) return acc;
        const date = new Date(post.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + (post.budget || 0);
        return acc;
    }, {} as {[key: string]: number});
    
    const campaignEarningsChartData = Object.entries(campaignEarningsByMonth).map(([name, earnings]) => ({name, earnings}));

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
  
        <motion.div 
          className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-xl mb-6 text-slate-800">Campaign Earnings Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignEarningsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickFormatter={(value) => `₹${formatNumber(value)}`}
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

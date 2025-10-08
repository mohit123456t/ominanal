'use client';
import React, { useMemo } from 'react';
import {
  Briefcase,
  PlayCircle,
  Users,
  IndianRupee,
  BarChart as BarChartIcon,
  Clock,
  UserPlus,
  UserX,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatNumber = (value: number) => {
    if (!value && value !== 0) return '0';
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

const SuperAdminDashboard = ({ users, campaigns }: { users: any[], campaigns: any[] }) => {
    
    const stats = useMemo(() => {
        const brands = users.filter(u => u.role === 'brand');
        const totalBrands = brands.length;
        
        const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
        const pendingCampaigns = campaigns.filter(c => c.status === 'Pending Approval').length;
        
        const totalCampaignEarnings = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
        
        const brandIdsWithCampaigns = new Set(campaigns.map(c => c.brandId));
        const brandsWithCampaigns = brands.filter(b => brandIdsWithCampaigns.has(b.uid)).length;
        const brandsWithoutCampaigns = totalBrands - brandsWithCampaigns;

        return {
            totalBrands,
            activeCampaigns,
            pendingCampaigns,
            brandsWithCampaigns,
            brandsWithoutCampaigns,
            totalCampaignEarnings,
        };
    }, [users, campaigns]);

    const safeFormat = (value: number) => formatNumber(value || 0);

    const revenueData = [
        { name: 'Jan', revenue: 4000, expenses: 2400 },
        { name: 'Feb', revenue: 3000, expenses: 1398 },
        { name: 'Mar', revenue: 9800, expenses: 2000 },
        { name: 'Apr', revenue: 3908, expenses: 2780 },
        { name: 'May', revenue: 4800, expenses: 1890 },
        { name: 'Jun', revenue: 3800, expenses: 2390 },
      ];

  
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
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Brands" value={safeFormat(stats.totalBrands)}
            icon={<Users className="text-blue-600"/>} colorClass="bg-blue-100" delay={0.1}
          />
          <StatCard
            title="Active Campaigns" value={safeFormat(stats.activeCampaigns)}
            icon={<PlayCircle className="text-green-600"/>} colorClass="bg-green-100" delay={0.2}
          />
           <StatCard
            title="Pending Campaigns" value={safeFormat(stats.pendingCampaigns)}
            icon={<Clock className="text-yellow-600"/>} colorClass="bg-yellow-100" delay={0.3}
          />
           <StatCard
            title="Brands with Campaigns" value={safeFormat(stats.brandsWithCampaigns)}
            icon={<UserPlus className="text-sky-600"/>} colorClass="bg-sky-100" delay={0.4}
          />
           <StatCard
            title="Brands without Campaigns" value={safeFormat(stats.brandsWithoutCampaigns)}
            icon={<UserX className="text-orange-600"/>} colorClass="bg-orange-100" delay={0.5}
          />
           <StatCard
            title="Total Campaign Earnings" value={`₹${safeFormat(stats.totalCampaignEarnings)}`}
            icon={<IndianRupee className="text-purple-600"/>} colorClass="bg-purple-100" delay={0.6}
          />
        </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <motion.div className="xl:col-span-2 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80" 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="font-bold text-xl mb-6 text-slate-800">Revenue Analytics</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/>
                            <Tooltip
                                cursor={{ stroke: 'rgba(79, 70, 229, 0.1)', strokeWidth: 2, strokeDasharray: '3 3' }}
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(5px)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)', 
                                    borderRadius: '12px'
                                }}
                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                            />
                            <Legend wrapperStyle={{ fontSize: '14px' }}/>
                            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} name="Revenue" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name="Expenses" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 className="font-bold text-xl mb-6 text-slate-800">Recent Brands</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {users.filter(u => u.role === 'brand').length > 0 ? users.filter(u => u.role === 'brand').slice(0, 5).map((brand: any, index) => (
                    <motion.div
                        key={brand.id}
                        className="p-4 bg-white/30 rounded-lg border border-slate-300/50 hover:bg-white/70 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                    >
                        <h4 className="font-semibold text-slate-800">{brand.brandName || brand.name || 'Unknown Brand'}</h4>
                        <p className="text-sm text-slate-500">Email: {brand.email || 'N/A'}</p>
                    </motion.div>
                    )) : <p className="text-slate-500">No brands available.</p>}
                </div>
            </motion.div>
        </div>

      </motion.div>
    );
};

export default SuperAdminDashboard;

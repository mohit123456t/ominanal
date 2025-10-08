'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckCircle,
  Users as UsersGroup,
  DollarSign,
} from 'lucide-react';

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string; }) => (
    <motion.div
      className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-slate-700">{title}</h3>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{value}</p>
    </motion.div>
  );

// 🖥️ Main Dashboard — iOS फ्रॉस्टेड ग्लास थीम
const DashboardView = ({ campaigns, users, expenses }: { campaigns: any[], users: any[], expenses: any[] }) => {
  const dashboardData = useMemo(() => {
    const totalRevenue = campaigns.reduce((sum, camp) => sum + (camp.budget || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const totalTeamMembers = users.filter(u => u.role && u.role !== 'brand').length;
    const pendingApprovals = campaigns.filter(c => c.status === 'Pending Approval').length;

    return {
      totalRevenue,
      activeCampaigns,
      totalTeamMembers,
      pendingApprovals,
    };
  }, [campaigns, users]);

  const brands = useMemo(() => users.filter(u => u.role === 'brand'), [users]);

  return (
    <div className="min-h-screen">
      <motion.div
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Dashboard</h1>
          <p className="text-md text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
      </motion.div>

        <motion.div>
              <motion.div initial="hidden" animate="show" className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Revenue" value={`₹${dashboardData.totalRevenue.toLocaleString()}`} icon={<DollarSign/>} color="bg-green-100 text-green-600"/>
                    <StatCard title="Active Campaigns" value={dashboardData.activeCampaigns.toString()} icon={<LayoutDashboard/>} color="bg-purple-100 text-purple-600"/>
                    <StatCard title="Team Members" value={dashboardData.totalTeamMembers.toString()} icon={<UsersGroup/>} color="bg-orange-100 text-orange-600"/>
                    <StatCard title="Pending Approvals" value={dashboardData.pendingApprovals.toString()} icon={<CheckCircle/>} color="bg-yellow-100 text-yellow-600"/>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <motion.div className="xl:col-span-3 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80" >
                    <h3 className="font-bold text-xl mb-6 text-slate-800">Recent Brands</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                       {brands.length > 0 ? brands.slice(0, 5).map((brand: any, index) => (
                        <motion.div
                          key={brand.id}
                          className="p-4 bg-white/30 rounded-lg border border-slate-300/50 hover:bg-white/70 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-semibold text-slate-800">{brand.name || 'Unknown Brand'}</h4>
                          <p className="text-sm text-slate-500">Email: {brand.email || 'N/A'}</p>
                        </motion.div>
                      )) : <p className="text-slate-500">No brands available.</p>}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
          </motion.div>
    </div>
  );
};

export default DashboardView;

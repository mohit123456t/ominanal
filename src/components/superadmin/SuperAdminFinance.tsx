
'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { IndianRupee, ChartBar, Tag } from 'lucide-react';

const formatNumber = (value: number) => {
    if (!value) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
};

const FinanceStatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
    <motion.div 
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
            <div className={`text-2xl p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">₹{value}</p>
    </motion.div>
);

const SuperAdminFinance = ({ data, onNavigate }: { data: any, onNavigate: (view: string) => void }) => {
    const financeData = data || {};
    const safeFormat = (value: number) => formatNumber(value || 0);
    const monthlyData = [
        { month: 'Jan', revenue: 240000, expenses: 150000 },
        { month: 'Feb', revenue: 310000, expenses: 180000 },
        { month: 'Mar', revenue: 450000, expenses: 250000 },
        { month: 'Apr', revenue: 420000, expenses: 280000 },
        { month: 'May', revenue: 580000, expenses: 350000 },
        { month: 'Jun', revenue: financeData.totalRevenue || 0, expenses: financeData.totalExpenses || 0 }, // Current month
    ];

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Financial Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time tracking of revenue, and expenses.</p>
                </div>
                <motion.button
                    onClick={() => onNavigate('pricing_management')}
                    className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="mr-2"><Tag size={18} /></span>
                    Manage Pricing
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FinanceStatCard 
                    title="Total Revenue"
                    value={safeFormat(financeData.totalRevenue)} 
                    icon={<IndianRupee />}
                    color="bg-green-100 text-green-600"
                />
                <FinanceStatCard 
                    title="Total Expenses"
                    value={safeFormat(financeData.totalExpenses)} 
                    icon={<ChartBar />}
                    color="bg-red-100 text-red-600"
                />
            </div>

            <motion.div 
                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-xl font-bold mb-6 text-slate-800">Monthly Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${formatNumber(value)}`} tickLine={false} axisLine={false}/>
                        <Tooltip 
                            formatter={(value: any) => `₹${formatNumber(value)}`}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0, 0, 0, 0.1)', 
                                borderRadius: '12px',
                             }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} name="Expenses" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    );
};

export default SuperAdminFinance;

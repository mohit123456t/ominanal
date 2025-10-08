'use client';
import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { IndianRupee, ChartBar, Tag, ArrowUp, ArrowDown } from 'lucide-react';

const formatNumber = (value: number) => {
    if (!value) return '0';
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
};

const FinanceStatCard = ({ title, value, icon, color, delay = 0 }: { title: string, value: string, icon: React.ReactNode, color: string, delay?: number }) => (
    <motion.div 
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold text-slate-700">{title}</h2>
            <div className={`text-2xl p-3 rounded-lg ${color}`}>{icon}</div>
        </div>
        <p className="text-4xl font-bold text-slate-900 mt-2 tracking-tight">₹{value}</p>
    </motion.div>
);

const SuperAdminFinance = ({ campaigns, expenses, onNavigate }: { campaigns: any[], expenses: any[], onNavigate: (view: string) => void }) => {
    
    const { totalRevenue, totalExpenses, netProfit, chartData } = useMemo(() => {
        const revenue = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
        const expenseTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const profit = revenue - expenseTotal;
        
        const monthlyData: { [key: string]: { month: string; revenue: number; expenses: number } } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize months
        monthNames.forEach(name => {
            monthlyData[name] = { month: name, revenue: 0, expenses: 0 };
        });

        // Populate with data
        campaigns.forEach(c => {
            if (c.createdAt?.seconds) {
                const month = monthNames[new Date(c.createdAt.seconds * 1000).getMonth()];
                if(month) monthlyData[month].revenue += c.budget || 0;
            }
        });
        expenses.forEach(e => {
            if (e.date) {
                const month = monthNames[new Date(e.date).getMonth()];
                if(month) monthlyData[month].expenses += e.amount || 0;
            }
        });

        return {
            totalRevenue: revenue,
            totalExpenses: expenseTotal,
            netProfit: profit,
            chartData: Object.values(monthlyData)
        };
    }, [campaigns, expenses]);


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
                    className="flex items-center bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="mr-2"><Tag size={18} /></span>
                    Manage Pricing
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinanceStatCard 
                    title="Total Revenue"
                    value={formatNumber(totalRevenue)} 
                    icon={<ArrowUp />}
                    color="bg-green-100 text-green-600"
                    delay={0.1}
                />
                <FinanceStatCard 
                    title="Total Expenses"
                    value={formatNumber(totalExpenses)} 
                    icon={<ArrowDown />}
                    color="bg-red-100 text-red-600"
                    delay={0.2}
                />
                 <FinanceStatCard 
                    title="Net Profit"
                    value={formatNumber(netProfit)} 
                    icon={<IndianRupee />}
                    color="bg-blue-100 text-blue-600"
                    delay={0.3}
                />
            </div>
            
            <motion.div 
                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-bold mb-6 text-slate-800">Monthly Performance</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${formatNumber(value)}`} tickLine={false} axisLine={false}/>
                            <Tooltip 
                                formatter={(value: any) => `₹${formatNumber(value)}`}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)', 
                                    borderRadius: '12px',
                                 }}
                            />
                            <Legend wrapperStyle={{ fontSize: '14px' }}/>
                            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} name="Revenue" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="expenses" stroke="#e11d48" strokeWidth={2.5} name="Expenses" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SuperAdminFinance;

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Banknote, Calendar } from 'lucide-react';

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
    <motion.div 
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80"
        whileHover={{ y: -5 }}
    >
        <div className="flex justify-between items-center">
            <span className={`p-3 rounded-full ${color}`}>
                {icon}
            </span>
        </div>
        <p className="text-slate-500 text-sm font-medium mt-4">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
    </motion.div>
);

const EarningsView = () => {
    // Placeholder data
    const earningsData = {
        total_earnings: 58500,
        month_earnings: 12500,
        last_payout: {
            amount: 25000,
            date: '2024-07-05',
        },
        transactions: [
            { id: 'TRX001', date: '2024-07-05', amount: 25000, status: 'Paid' },
            { id: 'TRX002', date: '2024-06-28', amount: 3500, status: 'Paid' },
            { id: 'TRX003', date: '2024-06-20', amount: 5000, status: 'Paid' },
        ]
    };

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-slate-800">Earnings Overview</h1>
                <p className="text-slate-500 mt-1">Track your payments and transaction history.</p>
            </motion.div>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={containerVariants}
            >
                <StatCard 
                    title="Total Earnings"
                    value={formatCurrency(earningsData.total_earnings)}
                    icon={<IndianRupee className="text-green-600" />}
                    color="bg-green-100"
                />
                <StatCard 
                    title="This Month"
                    value={formatCurrency(earningsData.month_earnings)}
                    icon={<Banknote className="text-blue-600" />}
                    color="bg-blue-100"
                />
                <StatCard 
                    title="Last Payout"
                    value={formatCurrency(earningsData.last_payout.amount)}
                    icon={<Calendar className="text-purple-600" />}
                    color="bg-purple-100"
                />
            </motion.div>
            
            <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80"
                variants={itemVariants}
            >
                <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Transactions</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50">
                            <tr>
                                <th className="p-3 font-semibold">Transaction ID</th>
                                <th className="p-3 font-semibold">Date</th>
                                <th className="p-3 font-semibold text-right">Amount</th>
                                <th className="p-3 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {earningsData.transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="p-3 font-mono text-slate-700">{tx.id}</td>
                                    <td className="p-3 text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-right font-semibold text-slate-800">{formatCurrency(tx.amount)}</td>
                                    <td className="p-3 text-center">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EarningsView;

'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PaymentsView = ({ userProfile }: { userProfile: any }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        thisMonth: 0,
        bonus: 0,
        total: 0
    });

    useEffect(() => {
        setLoading(true);
        // Placeholder data
        const placeholderPayments = [
            { id: '1', date: new Date().toISOString(), amount: 15000, status: 'Paid', bonus: 500 },
            { id: '2', date: new Date(Date.now() - 30 * 86400000).toISOString(), amount: 12000, status: 'Paid', bonus: 250 },
        ];
        
        let totalThisMonth = 0;
        let totalBonus = 0;
        let totalEarned = 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        placeholderPayments.forEach(p => {
            const paymentDate = new Date(p.date);
            if (paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear) {
                totalThisMonth += (p.amount || 0);
            }
            totalBonus += (p.bonus || 0);
            totalEarned += (p.amount || 0);
        });

        setPayments(placeholderPayments);
        setStats({
            thisMonth: totalThisMonth,
            bonus: totalBonus,
            total: totalEarned
        });
        setLoading(false);
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Earnings</h1>
                <p className="text-slate-500 mt-1">Track your payments and bonuses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-slate-300/70">
                    <p className="text-sm font-medium text-slate-500">Earnings This Month</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.thisMonth.toLocaleString()}</p>
                </div>
                 <div className="bg-white/40 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-slate-300/70">
                    <p className="text-sm font-medium text-slate-500">Performance Bonus</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.bonus.toLocaleString()}</p>
                </div>
                 <div className="bg-white/40 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-slate-300/70">
                    <p className="text-sm font-medium text-slate-500">Total Earned</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.total.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-slate-300/70">
                <h3 className="font-bold text-xl text-slate-800">Payment History</h3>
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-left">
                         <thead className="text-xs text-slate-500 bg-white/30">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8">Loading...</td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-slate-500">No payments found</td>
                                </tr>
                            ) : (
                                payments.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-white/30">
                                        <td className="p-4 text-slate-600">{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-4 font-semibold text-slate-800">₹{p.amount?.toLocaleString() || 0}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{p.status || 'Paid'}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsView;

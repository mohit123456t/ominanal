'use client';
import React, { useState, useEffect } from 'react';

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
                <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
                <p className="text-slate-600">Track your payments and bonuses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Earnings This Month</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.thisMonth.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Performance Bonus</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.bonus.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Total Earned</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.total.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg p-6 border-b text-slate-800">Payment History</h3>
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                            <p className="mt-2 text-slate-600">Loading payments...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-slate-600">No payments found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p: any) => (
                                    <tr key={p.id} className="border-b">
                                        <td className="px-6 py-4">{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold">₹{p.amount?.toLocaleString() || 0}</td>
                                        <td className="px-6 py-4 text-green-600">{p.status || 'Paid'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentsView;

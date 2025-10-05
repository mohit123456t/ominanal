'use client';
import React, { useState, useEffect } from 'react';
import { IndianRupee, Banknote, Calendar } from 'lucide-react';

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className="text-3xl text-slate-400">{icon}</div>
        </div>
    </div>
);

const PaymentsView = ({ userProfile }: { userProfile: any }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ thisMonth: 0, total: 0, lastPayout: 0 });

    useEffect(() => {
        setLoading(true);
        // Placeholder data
        const placeholderPayments = [
            { id: 'pay1', date: new Date(Date.now() - 5 * 86400000).toISOString(), amount: 20000, status: 'Paid' },
            { id: 'pay2', date: new Date(Date.now() - 35 * 86400000).toISOString(), amount: 25000, status: 'Paid' },
        ];
        
        let totalThisMonth = 0;
        let totalEarned = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        placeholderPayments.forEach(p => {
            const paymentDate = new Date(p.date);
            if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
                totalThisMonth += p.amount;
            }
            totalEarned += p.amount;
        });

        setPayments(placeholderPayments);
        setStats({
            thisMonth: totalThisMonth,
            total: totalEarned,
            lastPayout: placeholderPayments[0]?.amount || 0,
        });
        setLoading(false);
    }, []);

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
                <p className="text-slate-600">Track your payments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Earnings" value={formatCurrency(stats.total)} icon={<IndianRupee />} color="border-green-500" />
                <StatCard title="This Month" value={formatCurrency(stats.thisMonth)} icon={<Banknote />} color="border-blue-500" />
                <StatCard title="Last Payout" value={formatCurrency(stats.lastPayout)} icon={<Calendar />} color="border-purple-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg p-6 border-b text-slate-800">Payment History</h3>
                {loading ? (
                    <div className="p-6 text-center">Loading payments...</div>
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
                            {payments.map(p => (
                                <tr key={p.id} className="border-b">
                                    <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(p.amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {payments.length === 0 && !loading && <p className="text-center p-8 text-slate-500">No payments found.</p>}
            </div>
        </div>
    );
};

export default PaymentsView;

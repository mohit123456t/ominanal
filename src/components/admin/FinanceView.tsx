'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const FinanceView = ({ setView }: { setView: (view: string) => void }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        // Placeholder data
        const placeholderTransactions = [
            { id: 'txn_1', brandId: 'brand_a', timestamp: { seconds: Date.now() / 1000 - 86400 }, amount: 5000, status: 'Completed', type: 'DEPOSIT' },
            { id: 'txn_2', brandId: 'brand_b', timestamp: { seconds: Date.now() / 1000 - 172800 }, amount: 10000, status: 'Pending', type: 'DEPOSIT' },
            { id: 'txn_3', brandId: 'brand_c', timestamp: { seconds: Date.now() / 1000 - 259200 }, amount: 2500, status: 'Rejected', type: 'DEPOSIT' },
        ];
        setTransactions(placeholderTransactions);
        setLoading(false);
    }, []);

    const handleUpdateStatus = async (transaction: any, newStatus: string) => {
        if (!transaction.brandId || !transaction.id) {
            console.error("Invalid transaction object:", transaction);
            alert("Cannot update status due to invalid transaction data.");
            return;
        }

        // Placeholder logic
        alert(`This is a demo. Would have updated transaction ${transaction.id} to ${newStatus}.`);
        setTransactions(prev => prev.map(tx => tx.id === transaction.id ? { ...tx, status: newStatus } : tx));
    };
    
    return (
        <div className="p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Financial Transactions</h1>
                <button
                    onClick={() => setView('earnings')}
                    className="font-semibold text-white bg-sky-600 hover:bg-sky-700 px-5 py-2.5 rounded-lg transition-colors shadow-md"
                >
                    campaign Earnings
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="text-left p-3 font-semibold">Transaction ID</th>
                                <th className="text-left p-3 font-semibold">Brand ID</th>
                                <th className="text-left p-3 font-semibold">Date</th>
                                <th className="text-left p-3 font-semibold">Amount</th>
                                <th className="text-left p-3 font-semibold">Status</th>
                                <th className="text-left p-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-4 text-center text-slate-500">Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={6} className="p-4 text-center text-slate-500">No transactions found.</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                        <td className="p-3 font-mono text-xs">{tx.id}</td>
                                        <td className="p-3 font-mono text-xs">{tx.brandId}</td>
                                        <td className="p-3">{tx.timestamp ? new Date(tx.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-3 font-semibold">₹{tx.amount?.toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {tx.status === 'Pending' && (
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => handleUpdateStatus(tx, 'Completed')} className="p-1.5 text-green-600 hover:bg-green-100 rounded-md"><CheckCircle /></button>
                                                    <button onClick={() => handleUpdateStatus(tx, 'Rejected')} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md"><XCircle /></button>
                                                </div>
                                            )}
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

export default FinanceView;

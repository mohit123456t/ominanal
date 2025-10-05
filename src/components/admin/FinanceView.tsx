'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';


const FinanceView = ({ transactions, setView }: { transactions: any[], setView: (view: string) => void }) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const handleUpdateStatus = async (transaction: any, newStatus: string) => {
        if (!firestore || !transaction.brandId || !transaction.id) {
            toast({ variant: 'destructive', title: "Error", description: "Invalid transaction data or database connection." });
            return;
        }

        const transactionDocRef = doc(firestore, `users/${transaction.brandId}/transactions`, transaction.id);
        
        try {
            await updateDoc(transactionDocRef, { status: newStatus });
            if (newStatus === 'Completed' && transaction.type === 'DEPOSIT') {
                const userDocRef = doc(firestore, 'users', transaction.brandId);
                // Note: This needs a server-side function for security in production
                // For this demo, we'll optimistically update from the client.
                const { getDoc, runTransaction } = await import('firebase/firestore');
                await runTransaction(firestore, async (dbTransaction) => {
                    const userDoc = await dbTransaction.get(userDocRef);
                    if (!userDoc.exists()) {
                        throw new Error("User document not found!");
                    }
                    const newBalance = (userDoc.data().balance || 0) + transaction.amount;
                    dbTransaction.update(userDocRef, { balance: newBalance });
                });
            }
            toast({ title: 'Success', description: `Transaction status updated to ${newStatus}.` });
            // Note: The UI will update automatically due to the real-time listener in the parent component.
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Update Failed", description: error.message });
            console.error("Error updating transaction:", error);
        }
    };
    
    return (
        <div className="p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Financial Transactions</h1>
                <button
                    onClick={() => setView('earnings')}
                    className="font-semibold text-white bg-sky-600 hover:bg-sky-700 px-5 py-2.5 rounded-lg transition-colors shadow-md"
                >
                    Campaign Earnings
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
                            {transactions.length === 0 ? (
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

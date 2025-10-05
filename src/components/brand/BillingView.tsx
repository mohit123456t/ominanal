'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type User } from 'firebase/auth';
import AddFundsPanel from './AddFundsPanel';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';


// Status colors for transaction history
const statusColors = {
    Completed: 'bg-green-500/10 text-green-700 font-semibold',
    Pending: 'bg-yellow-500/10 text-yellow-700 font-semibold',
    Rejected: 'bg-red-500/10 text-red-700 font-semibold',
};

const BillingView = ({ user }: { user: User | null }) => {
    const firestore = useFirestore();
    const [showAddFunds, setShowAddFunds] = useState(false);
    
    // Fetch user data including balance
    const userDocRef = useMemoFirebase(() => user && firestore ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userData, isLoading: isUserLoading, error: userError } = useDoc(userDocRef);
    const currentBalance = userData?.balance || 0;
    
    // Fetch transactions
    const transactionsCollectionRef = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/transactions`) : null, [user, firestore]);
    const { data: transactions, isLoading: isTransactionsLoading, error: transactionsError } = useCollection(transactionsCollectionRef);


    const handleAddFunds = async () => {
        if (!transactionsCollectionRef || !user) return;
        
        // In a real app, this amount would come from the AddFundsPanel form.
        // For this demo, we'll use a fixed amount to prove the connection.
        const amountToAdd = 5000; 

        const newTransaction = {
            type: 'DEPOSIT',
            amount: amountToAdd,
            status: 'Pending',
            timestamp: serverTimestamp(),
            brandId: user.uid, // Add brandId to the transaction document
        };
        try {
            await addDoc(transactionsCollectionRef, newTransaction);
            alert('Your request to add funds has been submitted for admin approval.');
            setShowAddFunds(false);
        } catch (error) {
            console.error("Error adding funds request:", error);
            alert('Failed to submit funds request.');
        }
    };
    
    const error = userError || transactionsError;
    const isLoading = isUserLoading || isTransactionsLoading;

    const renderKeyMetrics = () => (
        <div className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/30">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-700">Current Balance</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">₹{currentBalance.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full border-2 border-green-500/20">
                    <span className="text-green-700 text-2xl">₹</span>
                </div>
            </div>
        </div>
    );

    const renderTransactionHistory = () => (
        <div className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/30 mt-8">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Transaction History</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-700">
                    <thead className="text-xs text-slate-600 uppercase bg-black/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 rounded-l-lg">Date</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3 text-center rounded-r-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-8 text-slate-500">Loading history...</td></tr>
                        ) : !transactions || transactions.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-8 text-slate-500">No transactions found.</td></tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-white/30">
                                    <td className="px-6 py-4 font-medium">{tx.timestamp ? new Date(tx.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{tx.type || 'N/A'}</td>
                                    <td className="px-6 py-4 font-semibold">₹{tx.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[tx.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>{tx.status}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (error) {
        return <div className="text-center p-8 text-red-600 bg-red-500/10 rounded-lg">{error.message}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Billing & Funds</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setShowAddFunds(!showAddFunds)}
                    className="font-semibold text-white bg-slate-800 hover:bg-slate-900 px-5 py-2.5 rounded-lg transition-colors shadow-md"
                >
                    {showAddFunds ? 'Close Panel' : 'Add Funds'}
                </button>
            </div>

            <AnimatePresence>
                {showAddFunds && (
                    <motion.div 
                        className="mb-8 bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, padding: 0, margin: 0 }}
                    >
                        <AddFundsPanel onComplete={handleAddFunds} />
                    </motion.div>
                )}
            </AnimatePresence>

            {renderKeyMetrics()}
            {renderTransactionHistory()}
        </motion.div>
    );
};

export default BillingView;

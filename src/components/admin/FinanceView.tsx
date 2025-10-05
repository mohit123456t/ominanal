'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Plus, LoaderCircle } from 'lucide-react';

const AddExpenseForm = ({ onAddExpense, onClose }: { onAddExpense: (data: any) => Promise<boolean>, onClose: () => void }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date) {
            alert("Please fill all fields.");
            return;
        }
        setIsSaving(true);
        const success = await onAddExpense({
            description,
            amount: parseFloat(amount),
            date,
        });
        setIsSaving(false);
        if (success) {
            onClose();
        }
    };

    return (
         <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-slate-200/80 rounded-2xl border border-white/20 shadow-2xl w-full max-w-lg"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
            >
                <form onSubmit={handleSubmit}>
                    <header className="p-5 border-b border-slate-900/10">
                        <h2 className="text-xl font-bold text-slate-800">Add New Expense</h2>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expense For *</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-3 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₹) *</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full p-3 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date *</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-3 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </main>
                    <footer className="p-5 flex justify-end space-x-3 border-t border-slate-900/10">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-900/10">Cancel</button>
                        <button type="submit" disabled={isSaving} className="flex items-center px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md disabled:bg-indigo-400">
                             {isSaving && <LoaderCircle className="animate-spin mr-2"/>}
                            {isSaving ? 'Saving...' : 'Save Expense'}
                        </button>
                    </footer>
                </form>
            </motion.div>
        </motion.div>
    )
};


const FinanceView = ({ transactions, expenses, onUpdateStatus, onAddExpense }: { transactions: any[], expenses: any[], onUpdateStatus: (transaction: any, newStatus: string) => void, onAddExpense: (expense: any) => Promise<boolean> }) => {
    const [showAddExpense, setShowAddExpense] = useState(false);
    
    return (
        <div className="p-1 space-y-8">
            <AnimatePresence>
                {showAddExpense && <AddExpenseForm onAddExpense={onAddExpense} onClose={() => setShowAddExpense(false)} />}
            </AnimatePresence>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Financial Transactions</h1>
                <div className='flex items-center gap-4'>
                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="flex items-center font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-md"
                    >
                        <Plus size={18} className="mr-2"/>
                        Add Expense
                    </button>
                    <button
                        onClick={() => { /* setView('earnings') - This needs to be passed in if needed */ }}
                        className="font-semibold text-white bg-sky-600 hover:bg-sky-700 px-5 py-2.5 rounded-lg transition-colors shadow-md"
                    >
                        Campaign Earnings
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 p-4 border-b border-slate-200">Brand Deposits</h3>
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
                                                    <button onClick={() => onUpdateStatus(tx, 'Completed')} className="p-1.5 text-green-600 hover:bg-green-100 rounded-md"><CheckCircle /></button>
                                                    <button onClick={() => onUpdateStatus(tx, 'Rejected')} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md"><XCircle /></button>
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

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 p-4 border-b border-slate-200">Recorded Expenses</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="text-left p-3 font-semibold w-2/5">Description</th>
                                <th className="text-left p-3 font-semibold">Date</th>
                                <th className="text-left p-3 font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr><td colSpan={3} className="p-4 text-center text-slate-500">No expenses recorded yet.</td></tr>
                            ) : (
                                expenses.map(ex => (
                                    <tr key={ex.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-800">{ex.description}</td>
                                        <td className="p-3">{new Date(ex.date).toLocaleDateString()}</td>
                                        <td className="p-3 font-semibold">₹{ex.amount?.toLocaleString()}</td>
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

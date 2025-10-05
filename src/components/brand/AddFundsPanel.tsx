'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AddFundsPanel = ({ onComplete }: { onComplete: () => void }) => {
    const [amount, setAmount] = useState('');
    const [selectedGateway, setSelectedGateway] = useState('upi');

    const handleAddFunds = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        // This component is now a placeholder and its logic is moved to BillingView.
        alert(`This is a demo. Fund request logic has been moved.`);
        onComplete();
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, padding: 0, margin: 0 }}
        >
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Funds to Wallet</h3>
            <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount (₹)</label>
                    <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="mt-1 w-full px-4 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                     <div className="grid grid-cols-3 gap-2">
                        <button type="button" onClick={() => setSelectedGateway('upi')} className={`py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${selectedGateway === 'upi' ? 'bg-blue-600 text-white' : 'bg-white/50 hover:bg-white/80'}`}>UPI</button>
                        <button type="button" onClick={() => setSelectedGateway('card')} className={`py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${selectedGateway === 'card' ? 'bg-blue-600 text-white' : 'bg-white/50 hover:bg-white/80'}`}>Card</button>
                        <button type="button" onClick={() => setSelectedGateway('netbanking')} className={`py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${selectedGateway === 'netbanking' ? 'bg-blue-600 text-white' : 'bg-white/50 hover:bg-white/80'}`}>Netbanking</button>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                     <button type="button" onClick={onComplete} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-200/50 rounded-lg hover:bg-slate-300/50">Cancel</button>
                     <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md">Add Funds</button>
                </div>
            </form>
        </motion.div>
    );
};

export default AddFundsPanel;

'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OrderForm = ({ campaign, onCreateOrder, onCancel }: { campaign: any; onCreateOrder: (order: any) => void; onCancel: () => void; }) => {
    const [reels, setReels] = useState(10);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // This is a placeholder for creating an order.
        console.log("Creating order (demo):", { campaignId: campaign.id, reels });
        alert('Order created successfully! (This is a demo)');
        setLoading(false);
        onCreateOrder({ campaignId: campaign.id, reels });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
        >
            <h2 className="text-xl font-bold mb-4">New Order for {campaign.name}</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Number of Reels:
                    <input
                        type="number"
                        value={reels}
                        onChange={(e) => setReels(Number(e.target.value))}
                        min="1"
                        required
                        className="w-full mt-1 p-2 border rounded"
                    />
                </label>
                <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-200 rounded">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {loading ? 'Creating...' : 'Create Order'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default OrderForm;

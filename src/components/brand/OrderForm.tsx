'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

const OrderForm = ({ campaign, onCreateOrder, onCancel }: { campaign: any; onCreateOrder: (order: any) => void; onCancel: () => void; }) => {
    const { user } = useUser();
    const firestore = useFirestore();

    const [formData, setFormData] = useState({
        type: '',
        quantity: '',
        budget: '',
        deadline: '',
        notes: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const orderTypes = [
        'Reels Creation',
        'Video Editing',
        'Thumbnail Design',
        'Script Writing',
        'Content Strategy',
        'Social Media Management'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.type) newErrors.type = 'Order type is required';
        if (!formData.quantity || parseInt(formData.quantity) <= 0) newErrors.quantity = 'A valid quantity is required';
        if (!formData.budget || parseFloat(formData.budget) <= 0) newErrors.budget = 'A valid budget is required';
        if (!formData.deadline) {
            newErrors.deadline = 'Deadline is required';
        } else {
            const deadlineDate = new Date(formData.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (deadlineDate < today) newErrors.deadline = 'Deadline must be today or in the future';
        }
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const newOrder = {
            campaignId: campaign.id,
            type: formData.type,
            quantity: parseInt(formData.quantity),
            budget: parseFloat(formData.budget),
            deadline: formData.deadline,
            status: 'Pending',
            notes: formData.notes
        };
        
        onCreateOrder(newOrder);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300/70 max-w-2xl w-full max-h-[90vh] flex flex-col animate-fade-in-up">
                {/* Header */}
                <div className="p-6 border-b border-slate-300/70">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Create New Order
                        </h2>
                        <button
                            onClick={onCancel}
                            className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/60 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                    <p className="text-slate-700 mt-1 text-sm">For Campaign: <span className="font-semibold">{campaign.name}</span></p>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
                    {Object.values(errors).filter(e => e).length > 0 && (
                         <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-800 text-sm font-medium border border-red-500/20">
                            Please fix the errors below.
                        </div>
                    )}
                   
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Order Type *</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                        >
                            <option value="">Select order type</option>
                            {orderTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        {errors.type && <p className="text-red-800 text-xs mt-1 font-medium">{errors.type}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Quantity *</label>
                            <input
                                type="number" name="quantity" value={formData.quantity}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                                placeholder="e.g., 5" min="1"
                            />
                            {errors.quantity && <p className="text-red-800 text-xs mt-1 font-medium">{errors.quantity}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Budget (₹) *</label>
                            <input
                                type="number" name="budget" value={formData.budget}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                                placeholder="e.g., 10000" min="0" step="1"
                            />
                            {errors.budget && <p className="text-red-800 text-xs mt-1 font-medium">{errors.budget}</p>}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Deadline *</label>
                        <input
                            type="date" name="deadline" value={formData.deadline}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                        />
                        {errors.deadline && <p className="text-red-800 text-xs mt-1 font-medium">{errors.deadline}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Additional Notes</label>
                        <textarea
                            name="notes" value={formData.notes}
                            onChange={handleInputChange} rows={3}
                            className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                            placeholder="Any specific requirements or instructions..."
                        />
                    </div>
                </form>

                 {/* Footer */}
                <div className="p-6 border-t border-slate-300/70 mt-auto">
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button" onClick={onCancel}
                            className="px-6 py-3 font-semibold text-slate-800 bg-white/40 hover:bg-white/60 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button" onClick={(e) => handleSubmit(e)}
                            className="px-6 py-3 font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-md transition-all"
                        >
                            Create Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;

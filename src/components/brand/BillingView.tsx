'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { type User } from 'firebase/auth';

const BillingView = ({ user }: { user: User | null }) => {
    return (
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center">
            <Wallet className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-2xl font-bold text-slate-800">Billing</h2>
            <p className="text-slate-500 mt-2">This is a placeholder for the brand billing view.</p>
             <p className="text-slate-400 text-sm mt-4">This section is under construction.</p>
        </div>
    );
};

export default BillingView;

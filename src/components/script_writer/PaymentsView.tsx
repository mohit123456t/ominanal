'use client';
import React from 'react';

const PaymentsView = ({ userProfile }: { userProfile: any }) => {
    return (
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Payments</h2>
            <p className="text-slate-500 mt-2">This is a placeholder for the Payments view.</p>
        </div>
    );
};

export default PaymentsView;

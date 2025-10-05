'use client';

import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardView = ({ campaigns, profile, onNewCampaign, onNavigateToAnalytics, onNavigateToCampaigns }: { campaigns: any[], profile: any, onNewCampaign: () => void, onNavigateToAnalytics: () => void, onNavigateToCampaigns: () => void }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-800">Welcome, {profile.brandName || 'Brand'}!</h2>
                <p className="text-slate-500 mt-2">Here's a quick overview of your account.</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg p-6">
                    <h3 className="font-semibold text-slate-800">Total Campaigns</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{campaigns.length}</p>
                </div>
                 <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg p-6 flex flex-col justify-between">
                    <h3 className="font-semibold text-slate-800">Quick Actions</h3>
                    <Button onClick={onNewCampaign} className="mt-4 w-full">Create New Campaign</Button>
                </div>
                 <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg p-6 text-center">
                    <LayoutDashboard className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-bold text-slate-800">Dashboard</h2>
                    <p className="text-slate-500 mt-2">This is a placeholder for the brand dashboard view.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;

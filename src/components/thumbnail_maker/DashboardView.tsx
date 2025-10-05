'use client';
import React from 'react';

const DashboardView = ({ userProfile, onTaskClick }: { userProfile: any, onTaskClick: (task: any) => void }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold">Thumbnail Maker Dashboard</h1>
            <p>Welcome, {userProfile?.name || 'User'}.</p>
            <p>This is a placeholder for the Dashboard view.</p>
        </div>
    );
};

export default DashboardView;

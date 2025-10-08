'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Upload, Clock, CheckCircle, IndianRupee, LoaderCircle } from 'lucide-react';
import { Post } from '@/lib/types';

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className="text-3xl text-slate-400">{icon}</div>
        </div>
    </div>
);

const DashboardView = ({ userProfile, posts, isLoading, onNavigate }: { userProfile: any, posts: Post[], isLoading: boolean, onNavigate: (view: string) => void }) => {
    
    const stats = useMemo(() => {
        if (!posts) return { totalUploads: 0, pending: 0, completed: 0, earnings: 0 };
        
        const completedPosts = posts.filter(p => p.status === 'Published');
        
        return {
            totalUploads: posts.length,
            pending: posts.filter(p => p.status === 'Scheduled').length,
            completed: completedPosts.length,
            earnings: completedPosts.length * 75, // Placeholder calculation
        };
    }, [posts]);

    const recentUploads = useMemo(() => posts?.slice(0, 5) || [], [posts]);

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-slate-100 text-slate-800';
            case 'Failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return <div className="text-center p-8"><LoaderCircle className="animate-spin h-8 w-8 mx-auto" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {userProfile?.name?.split(' ')[0]}!</h1>
                <p className="text-slate-600">Here’s a summary of your upload activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Uploads" value={stats.totalUploads} icon={<Upload />} color="border-blue-500" />
                <StatCard title="Scheduled" value={stats.pending} icon={<Clock />} color="border-yellow-500" />
                <StatCard title="Published" value={stats.completed} icon={<CheckCircle />} color="border-green-500" />
                <StatCard title="Total Earnings" value={`₹${stats.earnings.toLocaleString()}`} icon={<IndianRupee />} color="border-purple-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-lg text-slate-800">Recent Uploads</h3>
                    <button onClick={() => onNavigate('upload-history')} className="text-sm font-medium text-blue-600 hover:underline">View All</button>
                </div>
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Content</th>
                            <th className="px-6 py-3">Platform</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUploads.map(upload => (
                            <tr key={upload.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 line-clamp-1">{upload.content}</td>
                                <td className="px-6 py-4 capitalize">{upload.platform}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(upload.status)}`}>
                                        {upload.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(upload.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardView;

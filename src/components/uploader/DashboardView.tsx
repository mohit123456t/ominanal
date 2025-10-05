'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Clock, CheckCircle, IndianRupee } from 'lucide-react';

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

const DashboardView = ({ userProfile, onNavigate }: { userProfile: any, onNavigate: (view: string) => void }) => {
    const [stats, setStats] = useState({ totalUploads: 0, pending: 0, completed: 0, earnings: 0 });
    const [recentUploads, setRecentUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Placeholder data
        const placeholderStats = { totalUploads: 58, pending: 5, completed: 53, earnings: 45000 };
        const placeholderRecentUploads = [
            { id: 'up1', reelTitle: 'Summer Fashion Reel', campaign: 'Summer Sale', status: 'Completed', date: new Date().toISOString() },
            { id: 'up2', reelTitle: 'Diwali Special Reel', campaign: 'Diwali Dhamaka', status: 'Pending', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 'up3', reelTitle: 'Product Launch Teaser', campaign: 'New Gadget', status: 'Completed', date: new Date(Date.now() - 2 * 86400000).toISOString() },
        ];
        setStats(placeholderStats);
        setRecentUploads(placeholderRecentUploads);
        setLoading(false);
    }, []);

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {userProfile?.name?.split(' ')[0]}!</h1>
                <p className="text-slate-600">Here’s a summary of your upload activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Uploads" value={stats.totalUploads} icon={<Upload />} color="border-blue-500" />
                <StatCard title="Pending Review" value={stats.pending} icon={<Clock />} color="border-yellow-500" />
                <StatCard title="Completed" value={stats.completed} icon={<CheckCircle />} color="border-green-500" />
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
                            <th className="px-6 py-3">Reel Title</th>
                            <th className="px-6 py-3">Campaign</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUploads.map(upload => (
                            <tr key={upload.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{upload.reelTitle}</td>
                                <td className="px-6 py-4">{upload.campaign}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(upload.status)}`}>
                                        {upload.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(upload.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardView;

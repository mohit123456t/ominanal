'use client';
import React, { useMemo } from 'react';

const DashboardView = ({ userProfile, tasks, onTaskClick }: { userProfile: any, tasks: any[], onTaskClick: (task: any) => void }) => {
    
    const stats = useMemo(() => {
        const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const approved = tasks.filter(t => t.status === 'Approved').length;
        return { pending, inProgress, approved };
    }, [tasks]);

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Revision': return 'bg-orange-100 text-orange-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userProfile?.name?.split(' ')[0]}!</h1>
                <p className="text-slate-600">Here's what's happening with your scripts today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Pending Scripts</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Scripts In Progress</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.inProgress}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Approved Scripts</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.approved}</p>
                </div>
            </div>

            {/* Recent Tasks Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg p-6 border-b text-slate-800">Your Active Tasks</h3>
                {tasks.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-slate-600">No tasks assigned to you yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Video Title</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.slice(0, 5).map(task => ( // Show only top 5 recent tasks
                                <tr key={task.id} className="border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{task.videoTitle}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onTaskClick(task)} className="font-medium text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DashboardView;

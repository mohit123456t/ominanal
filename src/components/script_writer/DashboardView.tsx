'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, delay = 0 }: { title: string, value: string | number, icon: React.ReactNode, color: string, delay?: number }) => (
    <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
    >
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-slate-700">{title}</h3>
            <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
    </motion.div>
);

const DashboardView = ({ userProfile, tasks, onTaskClick }: { userProfile: any, tasks: any[], onTaskClick: (task: any) => void }) => {
    
    const stats = useMemo(() => {
        const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const approved = tasks.filter(t => t.status === 'Approved').length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        return { pending, inProgress, approved, completed };
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
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Good morning, {userProfile?.name?.split(' ')[0]}!</h1>
                <p className="text-slate-500 mt-1">Here's your script writing overview.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pending Scripts" value={stats.pending} icon={<div className="h-6 w-6" />} color="bg-yellow-100" delay={1} />
                <StatCard title="In Progress" value={stats.inProgress} icon={<div className="h-6 w-6" />} color="bg-blue-100" delay={2} />
                <StatCard title="Approved Scripts" value={stats.approved} icon={<div className="h-6 w-6" />} color="bg-green-100" delay={3} />
                <StatCard title="Total Completed" value={stats.completed} icon={<div className="h-6 w-6" />} color="bg-purple-100" delay={4} />
            </div>

            <motion.div 
                className="bg-white rounded-xl shadow-sm border border-slate-200/80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="font-bold text-xl p-6 border-b text-slate-800">Your Active Tasks</h3>
                {tasks.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-slate-600">No tasks assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Video Title</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks.slice(0, 5).map(task => (
                                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{task.videoTitle}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => onTaskClick(task)} className="font-medium text-blue-600 hover:underline">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DashboardView;

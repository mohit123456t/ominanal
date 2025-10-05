'use client';
import React, { useState, useEffect } from 'react';

const AssignedTasks = ({ userProfile, onTaskClick }: { userProfile: any, onTaskClick: (task: any) => void }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder data
        setLoading(true);
        const tasksData = [
            { id: '1', videoTitle: 'Epic Gaming Moments', status: 'Pending', assignedAt: new Date() },
            { id: '2', videoTitle: 'Cooking Challenge', status: 'In Progress', assignedAt: new Date(Date.now() - 86400000) },
            { id: '3', videoTitle: 'Travel Vlog: Japan', status: 'Completed', assignedAt: new Date(Date.now() - 2 * 86400000) },
        ];
        setTasks(tasksData);
        setLoading(false);
    }, [userProfile]);

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Pending':
            case 'Assigned':
                return 'bg-yellow-100 text-yellow-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Revision':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg p-6 border-b text-slate-800">All Assigned Tasks</h3>
            {loading ? (
                <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                    <p className="mt-2 text-slate-600">Loading tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="p-6 text-center">
                    <p className="text-slate-600">No tasks have been assigned to you yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Video Title</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Assigned Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className="border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{task.videoTitle}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onTaskClick(task)} className="font-medium text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AssignedTasks;

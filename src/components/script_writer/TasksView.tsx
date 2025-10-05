'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Download, File, MessageSquare, Scissors, Upload, XCircle } from 'lucide-react';


const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses: { [key: string]: string } = {
        "Active": "bg-green-100 text-green-800",
        "Completed": "bg-slate-200 text-slate-800",
        "Pending": "bg-yellow-100 text-yellow-800",
        "In Progress": "bg-blue-100 text-blue-800",
        "Submitted": "bg-yellow-100 text-yellow-800",
        "Approved": "bg-green-100 text-green-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const TaskDetailsView = ({ task, onClose }: { task: any, onClose: () => void }) => {
    if (!task) return null;

    // Mock data for task details based on passed task
    const taskDetails = {
        id: task.id || 'V015',
        campaign: task.videoTitle || 'Summer Glow',
        status: task.status || 'In-Progress',
        progress: 60,
        assigned: task.dueDate ? new Date(new Date(task.dueDate).getTime() - 5 * 86400000).toLocaleDateString() : new Date().toLocaleDateString(),
        deadline: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
        description: `Create a compelling script for the '${task.videoTitle}' video. Focus on engaging storytelling and clear calls to action.`,
        requirements: [
            'Script should be between 150-200 words.',
            'Maintain a witty and engaging tone.',
            'Include at least two calls to action.',
            'Mention the "Summer Glow" product line.',
        ],
        assets: [
            { name: 'Campaign Brief.pdf', size: '1.2 MB', uploaded: new Date().toLocaleDateString() },
            { name: 'Product Images.zip', size: '15 MB', uploaded: new Date().toLocaleDateString() },
        ],
        comments: [
            { user: 'Admin', message: 'Please ensure the script is ready for review by tomorrow.', time: '2024-01-08 10:30 AM' },
        ]
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Task Details: {taskDetails.campaign}</h2>
                <button onClick={onClose}><XCircle /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border">
                           <h3 className="font-bold text-lg mb-3 text-slate-800">Task Information</h3>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-slate-500 font-medium">Task ID</p><p className="font-semibold text-slate-800">{taskDetails.id}</p></div>
                                <div><p className="text-slate-500 font-medium">Campaign</p><p className="font-semibold text-slate-800">{taskDetails.campaign}</p></div>
                                <div><p className="text-slate-500 font-medium">Assigned</p><p className="font-semibold text-slate-800">{taskDetails.assigned}</p></div>
                                <div><p className="text-slate-500 font-medium">Deadline</p><p className="font-semibold text-red-600">{taskDetails.deadline}</p></div>
                           </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Description</h3>
                            <p className="text-slate-600 leading-relaxed">{taskDetails.description}</p>
                        </div>
                         <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="font-bold text-lg mb-3 text-slate-800">Requirements</h3>
                            <ul className="space-y-2">
                                {taskDetails.requirements.map((req, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-green-500 mr-2 mt-1"><CheckCircle size={16}/></span>
                                        <span className="text-slate-600 text-sm">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                     <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border">
                             <h3 className="font-bold text-lg mb-3 text-slate-800">Available Assets</h3>
                              <div className="space-y-2">
                                {taskDetails.assets.map((asset, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                        <div className="flex items-center">
                                            <span className="text-slate-400 mr-2"><File size={16}/></span>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{asset.name}</p>
                                                <p className="text-xs text-slate-500">{asset.size}</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-500 hover:text-slate-700"><Download size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border">
                             <h3 className="font-bold text-lg mb-3 text-slate-800">Submit Your Work</h3>
                             <textarea placeholder="Paste your script here..." rows={4} className="w-full p-2 border rounded-md text-sm mb-2"></textarea>
                             <button className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                                <Upload size={16} className="mr-2"/> Submit Script
                             </button>
                        </div>
                     </div>
                 </div>
            </div>
        </div>
        </div>
    );
};

const TasksView = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        // Placeholder data
        const placeholderTasks = [
            { id: 'task1', videoTitle: 'First Script Task', status: 'Pending', dueDate: new Date(Date.now() + 86400000).toISOString() },
            { id: 'task2', videoTitle: 'Second Script Task', status: 'In Progress', dueDate: new Date(Date.now() + 2 * 86400000).toISOString() },
            { id: 'task3', videoTitle: 'Third Script Task', status: 'Approved', dueDate: new Date(Date.now() - 86400000).toISOString() },
        ];
        setTasks(placeholderTasks);
        setLoading(false);
    }, []);
    
    const handleOpenModal = (task: any) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
            <div className="p-4 border-b">
                 <h3 className="font-bold text-lg text-slate-800 mb-2">Assigned Tasks</h3>
            </div>
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">⏳</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Tasks...</h3>
                        <p className="text-slate-600">Please wait while we fetch your assigned tasks</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks assigned</h3>
                        <p className="text-slate-600">You have no active tasks assigned.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-slate-800">{task.videoTitle}</h4>
                                    <StatusBadge status={task.status} />
                                </div>
                                <p className="text-xs text-slate-500 mb-2">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</p>
                                <button onClick={() => handleOpenModal(task)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <AnimatePresence>
              {isModalOpen && <TaskDetailsView task={selectedTask} onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default TasksView;

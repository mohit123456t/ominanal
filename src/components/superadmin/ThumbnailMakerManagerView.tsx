'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';

// --- इंटरफ़ेस परिभाषाएं ---
interface UserProfile {
    uid: string;
    name: string;
    email: string;
    mobile?: string;
    dob?: string;
}
interface StaffStats { assigned: number; pending: number; completed: number; }
interface EnrichedStaffProfile extends UserProfile { stats: StaffStats; }

// --- मुख्य कंपोनेंट ---
const ThumbnailMakerManagerView = () => {
    const [thumbnailMakers, setThumbnailMakers] = useState<EnrichedStaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState<EnrichedStaffProfile | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [staffTasks, setStaffTasks] = useState<any[]>([]);
    
    // Placeholder data
    const placeholderThumbnailMakers: EnrichedStaffProfile[] = [
        { uid: 'thumb-1', name: 'Kavya Singh', email: 'kavya@example.com', stats: { assigned: 12, pending: 4, completed: 8 } },
        { uid: 'thumb-2', name: 'Vikram Reddy', email: 'vikram@example.com', stats: { assigned: 9, pending: 1, completed: 8 } },
    ];
    const placeholderStaffTasks = [
        { id: 'task-1', videoTitle: 'Unboxing New Gadget', status: 'In Progress' },
        { id: 'task-2', videoTitle: 'Travel Vlog Thumbnail', status: 'Completed' },
    ];

    const fetchStaffData = useCallback(async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setThumbnailMakers(placeholderThumbnailMakers);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900"></div>
                <p className="text-center mt-4 text-lg font-semibold text-slate-700">Loading Thumbnail Makers...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Thumbnail Maker Management</h1>
                <p className="text-slate-500 mt-1">Manage and monitor thumbnail maker performance and assignments</p>
            </div>

            {thumbnailMakers.length === 0 ? (
                <motion.div 
                    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="text-slate-400 mb-4 text-4xl mx-auto w-fit"><Users size={40} /></div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Thumbnail Makers Found</h3>
                    <p className="text-slate-500">Add thumbnail makers to start managing their activities.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thumbnailMakers.map((maker, index) => (
                        <motion.div 
                            key={maker.uid} 
                            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6 hover:shadow-xl transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center">
                                     <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 border-2 border-white">
                                        <span className="text-purple-600 font-semibold text-sm">{maker.name?.charAt(0)?.toUpperCase() || 'T'}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{maker.name || 'Unnamed Maker'}</h3>
                                        <p className="text-sm text-slate-500">ID: {maker.uid.slice(-6)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6 text-center bg-white/30 p-3 rounded-lg">
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{maker.stats.assigned}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Assigned</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{maker.stats.pending}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Pending</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{maker.stats.completed}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Completed</div>
                                </div>
                            </div>
                             <div className="flex space-x-3">
                                <button onClick={() => {
                                  setSelectedStaff(maker);
                                  setStaffTasks(placeholderStaffTasks);
                                  setIsDetailsModalOpen(true);
                                }} className="flex-1 px-4 py-2.5 bg-slate-500/10 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-500/20 transition-colors">View Details</button>
                                <button onClick={() => {
                                  setSelectedStaff(maker);
                                  setStaffTasks(placeholderStaffTasks);
                                  setIsAssignModalOpen(true);
                                }} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">Assign Task</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            <AnimatePresence>
                {isAssignModalOpen && selectedStaff && (
                    <motion.div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-slate-300/70" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                            <h3 className="text-lg font-bold p-6 border-b border-slate-300/50 text-slate-800">Assign Task to {selectedStaff.name}</h3>
                            <form className="p-6" onSubmit={async (e) => {
                                e.preventDefault();
                                alert('Task assigned (demo)!');
                                setIsAssignModalOpen(false);
                            }}>
                                <input name="videoTitle" placeholder="Video Title" required className="w-full p-3 bg-white/50 border border-slate-300/70 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold mb-2 text-slate-700">Current Tasks</h4>
                                    {staffTasks.length === 0 ? (
                                        <p className="text-sm text-slate-500">No tasks assigned.</p>
                                    ) : (
                                        <ul className="space-y-2 max-h-32 overflow-y-auto p-2 bg-white/20 rounded-lg">
                                            {staffTasks.map(task => (
                                                <li key={task.id} className="p-2 bg-white/30 rounded text-sm text-slate-800">{task.videoTitle} - {task.status}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-slate-300/50">
                                    <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-6 py-2.5 font-medium text-slate-700 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20">Assign</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
                {isDetailsModalOpen && selectedStaff && (
                    <motion.div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-slate-300/70" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                            <h3 className="text-lg font-bold p-6 border-b border-slate-300/50 text-slate-800">Details for {selectedStaff.name}</h3>
                            <div className="p-6 overflow-y-auto space-y-4">
                                <div className="bg-white/30 p-4 rounded-lg">
                                    <h4 className="text-md font-semibold mb-2 text-slate-700">Profile Info</h4>
                                    <div className="text-sm text-slate-800 space-y-1">
                                        <p><strong>Name:</strong> {selectedStaff.name || 'N/A'}</p>
                                        <p><strong>Email:</strong> {selectedStaff.email}</p>
                                        {/* ... other details */}
                                    </div>
                                </div>
                                <div className="bg-white/30 p-4 rounded-lg">
                                    <h4 className="text-md font-semibold mb-2 text-slate-700">Update Profile</h4>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        alert('Profile updated (demo)!');
                                    }}>
                                        <input name="mobile" placeholder="Mobile" defaultValue={selectedStaff.mobile} className="w-full p-2 bg-white/50 border border-slate-300/70 rounded mb-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        <input type="date" name="dob" defaultValue={selectedStaff.dob} className="w-full p-2 bg-white/50 border border-slate-300/70 rounded mb-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20">Update</button>
                                    </form>
                                </div>
                                <div className="bg-white/30 p-4 rounded-lg">
                                    <h4 className="text-md font-semibold mb-2 text-slate-700">Tasks</h4>
                                    {staffTasks.length === 0 ? (
                                        <p className="text-sm text-slate-500">No tasks assigned.</p>
                                    ) : (
                                        <ul className="space-y-2 max-h-32 overflow-y-auto">
                                            {staffTasks.map(task => (
                                                <li key={task.id} className="p-2 bg-white/30 rounded text-sm text-slate-800">{task.videoTitle} - {task.status}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-white/20 flex justify-end mt-auto border-t border-slate-300/50">
                                <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-2.5 font-medium text-slate-700 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg">Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ThumbnailMakerManagerView;

'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Clipboard } from 'lucide-react';
import { isSameDay, parseISO } from 'date-fns';

interface VideoTask { id: string; assignedTo: string; status?: string; createdAt?: string; completedAt?: string; }

const StatCard = ({ title, value, icon, subtitle }: { title: string; value: string; icon: React.ReactNode; subtitle?: string; }) => (
    <motion.div
        className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80"
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className="text-slate-400 text-2xl">{icon}</div>
        </div>
    </motion.div>
);

const DashboardView = () => {
    const [tasks, setTasks] = useState<VideoTask[]>([]);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Placeholder data
        const placeholderProfile = { name: 'Demo Editor', email: 'editor@example.com' };
        const placeholderTasks: VideoTask[] = [
            { id: '1', assignedTo: 'editor@example.com', status: 'completed', createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
            { id: '2', assignedTo: 'editor@example.com', status: 'in-progress', createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: '3', assignedTo: 'editor@example.com', status: 'pending', createdAt: new Date().toISOString() }
        ];
        setUserProfile(placeholderProfile);
        setTasks(placeholderTasks);
        setIsLoading(false);
    }, []);

    const isToday = (dateString?: string): boolean => {
        if (!dateString) return false;
        try { return isSameDay(parseISO(dateString), new Date()); } catch { return false; }
    };

    // Calculate stats based on the real-time `tasks` state.
    const stats = useMemo(() => {
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const totalAssigned = tasks.length;
        const totalCompleted = completedTasks.length;
        const approvalRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
        const todayAssigned = tasks.filter(task => isToday(task.createdAt)).length;
        const todayCompleted = completedTasks.filter(task => isToday(task.completedAt)).length;

        return {
            pendingTasks: totalAssigned - totalCompleted,
            totalCompleted,
            approvalRate,
            todayAssigned,
            todayCompleted,
        };
    }, [tasks]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <span className="text-4xl">⏳</span>
                    <h3 className="text-lg font-semibold mt-4">Loading Dashboard...</h3>
                </div>
            </div>
        );
    }

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

    return (
        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Welcome, {userProfile?.name || 'Editor'}</h1>
                <p className="text-slate-500 mt-1">Your real-time editing dashboard is ready.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Pending Tasks" value={stats.pendingTasks.toString()} icon={<Bell />} />
                <StatCard title="Tasks Completed" value={stats.totalCompleted.toString()} subtitle={`${stats.approvalRate}% completion rate`} icon={<CheckCircle />} />
                <StatCard title="Assigned Today" value={stats.todayAssigned.toString()} icon={<Clipboard />} />
                <StatCard title="Completed Today" value={stats.todayCompleted.toString()} icon={<CheckCircle />} />
            </div>
        </motion.div>
    );
};

export default DashboardView;

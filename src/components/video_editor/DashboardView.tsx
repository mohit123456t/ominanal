'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Clipboard } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

interface VideoTask {
  id: string;
  assignedTo: string;
  status?: string;
  createdAt?: { seconds: number; nanoseconds: number };
  completedAt?: string;
}

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

const DashboardView = ({ tasks, userProfile }: { tasks: VideoTask[], userProfile: any }) => {

    const isDateToday = (date?: { seconds: number, nanoseconds: number }): boolean => {
        if (!date) return false;
        try {
            return isToday(new Date(date.seconds * 1000));
        } catch {
            return false;
        }
    };
    
    const isStringDateToday = (dateString?: string): boolean => {
        if (!dateString) return false;
        try { return isSameDay(parseISO(dateString), new Date()); } catch { return false; }
    };


    const stats = useMemo(() => {
        if (!tasks) return { pendingTasks: 0, totalCompleted: 0, approvalRate: 0, todayAssigned: 0, todayCompleted: 0 };
        
        const completedTasks = tasks.filter(task => task.status === 'Completed' || task.status === 'Approved');
        const totalAssigned = tasks.length;
        const totalCompleted = completedTasks.length;
        const approvalRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
        const todayAssigned = tasks.filter(task => isDateToday(task.createdAt)).length;
        const todayCompleted = completedTasks.filter(task => isStringDateToday(task.completedAt)).length;

        return {
            pendingTasks: totalAssigned - totalCompleted,
            totalCompleted,
            approvalRate,
            todayAssigned,
            todayCompleted,
        };
    }, [tasks]);

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

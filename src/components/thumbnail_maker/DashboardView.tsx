'use client';
import React, { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { isSameDay, parseISO } from 'date-fns';

interface Task {
  id: string;
  [key: string]: any;
}

interface Stats {
  pending: number;
  inProgress: number;
  completed: number;
  totalEarnings: number;
}

interface UserProfile {
  email?: string;
  name?: string;
  uid?: string;
  [key: string]: any;
}

interface DashboardViewProps {
  userProfile: UserProfile | null;
  onTaskClick?: (task: Task) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ userProfile, onTaskClick }) => {
  const { firestore } = useFirebase();

  const tasksQuery = useMemoFirebase(() => {
    if (!userProfile?.uid || !firestore) return null;
    return query(collection(firestore, 'work_items'), where('assignedTo', '==', userProfile.uid), where('type', '==', 'thumbnail'));
  }, [userProfile, firestore]);

  const { data: tasks, isLoading: loading } = useCollection(tasksQuery);

  const isToday = (dateString?: string): boolean => {
    if (!dateString) return false;
    try { return isSameDay(parseISO(dateString), new Date()); } catch { return false; }
  };

  const stats = useMemo(() => {
    if (!tasks) return { pending: 0, inProgress: 0, completed: 0, totalEarnings: 0 };
    
    const completedTasks = tasks.filter(task => task.status === 'Completed' || task.status === 'Approved');
    const totalAssigned = tasks.length;
    const totalCompleted = completedTasks.length;
    const approvalRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    
    return {
      pending: tasks.filter(t => ['Pending', 'Assigned'].includes(t.status)).length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: totalCompleted,
      totalEarnings: totalCompleted * 150, // Placeholder calculation
    };
  }, [tasks]);

  const StatCard: React.FC<{
    label: string;
    value: string | number;
    color?: 'slate' | 'green' | 'blue' | 'purple';
    delay?: number;
    pulse?: boolean;
  }> = ({ label, value, color = 'slate', delay = 0, pulse = false }) => (
    <div
      className={`
        relative bg-white rounded-2xl shadow-sm border border-slate-100 
        p-6 flex flex-col justify-between group
        transition-all duration-500 hover:shadow-lg hover:-translate-y-1
        before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-1 
        ${color === 'green' ? 'before:bg-green-500' : 
          color === 'blue' ? 'before:bg-blue-500' :
          color === 'purple' ? 'before:bg-purple-500' : 'before:bg-slate-400'}
        animate-slide-up
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">{label}</div>
      <div className={`text-3xl md:text-4xl font-black ${color === 'green' ? 'text-green-600' : 'text-slate-800'}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/40 p-6">
      <div className="mb-10 max-w-4xl animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {userProfile?.name?.split(' ')[0] || 'Creator'}
          </span>
          !
        </h1>
        <p className="text-lg text-slate-600 mt-2">Track your tasks, progress, and earnings — all in one beautiful dashboard.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          label="Pending Tasks"
          value={loading ? '--' : stats.pending}
          color="slate"
          delay={200}
          pulse={stats.pending > 0}
        />
        <StatCard
          label="In Progress"
          value={loading ? '--' : stats.inProgress}
          color="blue"
          delay={400}
          pulse={stats.inProgress > 0}
        />
        <StatCard
          label="Completed"
          value={loading ? '--' : stats.completed}
          color="purple"
          delay={600}
          pulse={stats.completed > 0}
        />
        <StatCard
          label="Total Earnings"
          value={loading ? '--' : `₹${stats.totalEarnings.toLocaleString()}`}
          color="green"
          delay={800}
          pulse={stats.totalEarnings > 0}
        />
      </div>
    </div>
  );
};

export default DashboardView;

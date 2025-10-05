'use client';
import React, { useState, useEffect } from 'react';

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
  [key: string]: any;
}

interface DashboardViewProps {
  userProfile: UserProfile | null;
  onTaskClick?: (task: Task) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ userProfile, onTaskClick }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    // Using placeholder data
    setLoading(true);
    const tasksData: Task[] = [
        { id: '1', status: 'Pending', assignedAt: new Date() },
        { id: '2', status: 'In Progress', assignedAt: new Date() },
        { id: '3', status: 'Completed', assignedAt: new Date() },
        { id: '4', status: 'Approved', assignedAt: new Date() },
    ];
    const totalEarnings = 5000; // Placeholder
    setTasks(tasksData);

    const pending = tasksData.filter(t => ['Pending', 'Assigned'].includes(t.status)).length;
    const inProgress = tasksData.filter(t => t.status === 'In Progress').length;
    const completed = tasksData.filter(t => ['Completed', 'Approved'].includes(t.status)).length;

    setStats({ pending, inProgress, completed, totalEarnings });
    setLoading(false);
  }, [userProfile]);

  // Reusable Animated Stat Card Component
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
      {/* Subtle corner accent */}
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">{label}</div>
      <div className={`text-3xl md:text-4xl font-black ${color === 'green' ? 'text-green-600' : 'text-slate-800'}`}>
        {value}
      </div>

      {/* Pulse glow for active stats */}
      {pulse && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-purple-400/5 to-transparent animate-pulse-once pointer-events-none"></div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/40 p-6">
      {/* Welcome Header */}
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

      {/* Stats Grid */}
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

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow border border-slate-100 animate-pulse"
              style={{ animationDelay: `${1000 + i * 200}ms` }}
            >
              <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardView;

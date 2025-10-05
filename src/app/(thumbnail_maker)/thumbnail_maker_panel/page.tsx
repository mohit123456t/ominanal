'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Clipboard,
    MessageSquare,
    IndianRupee,
    Users,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

import DashboardView from '@/components/thumbnail_maker/DashboardView';
import AssignedTasks from '@/components/thumbnail_maker/AssignedTasks';
import TaskDetailView from '@/components/thumbnail_maker/TaskDetailView';
import CommunicationView from '@/components/thumbnail_maker/CommunicationView';
import EarningsView from '@/components/thumbnail_maker/EarningsView';
import ProfileView from '@/components/thumbnail_maker/ProfileView';

const Logo = () => (
    <div className="flex items-center gap-2">
        <svg
            className="size-8 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            fill="currentColor"
            />
            <path
            d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
            <path
            d="M12 2V22"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
        </svg>
        <h2 className="font-bold text-lg text-slate-800">OmniPost AI</h2>
    </div>
);


const NavItem = ({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: ()=>void, collapsed: boolean}) => (
    <motion.button
        onClick={onClick}
        className={`group relative flex items-center w-full text-left px-4 py-3 text-sm font-semibold rounded-lg 
                    transition-all duration-300 ease-in-out transform 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                    ${
            active
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
        } ${collapsed ? 'justify-center' : ''}`}
        
    >
        <span className={`transition-all duration-300 transform ${collapsed ? '' : 'mr-4'} ${active ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:text-slate-600 group-hover:rotate-6'}`}>{icon}</span>
        {!collapsed && <span className="flex-1">{label}</span>}
        {active && !collapsed && (
             <span className="absolute right-0 h-6 w-1 bg-indigo-600 rounded-l-lg transition-all duration-300"></span>
        )}
    </motion.button>
);


const ThumbnailMakerPanel = () => {
    const router = useRouter();
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedTask, setSelectedTask] = useState(null);
    const [userProfile, setUserProfile] = useState<any>({ name: 'Thumbnail Maker' });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
        { id: 'my-tasks', label: 'My Tasks', icon: <Clipboard /> },
        { id: 'communication', label: 'Communication', icon: <MessageSquare /> },
        { id: 'earnings', label: 'Earnings', icon: <IndianRupee /> },
        { id: 'profile', label: 'Profile', icon: <Users /> },
    ];

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
    };

    const handleBack = () => {
        setSelectedTask(null);
    };
    
    const handleLogout = () => {
        router.push('/login');
    };

    const renderView = () => {
        if (selectedTask) {
            return <TaskDetailView task={selectedTask} onBack={handleBack} userProfile={userProfile} />;
        }

        switch (activeView) {
            case 'dashboard':
                return <DashboardView userProfile={userProfile} onTaskClick={handleTaskClick} />;
            case 'my-tasks':
                return <AssignedTasks userProfile={userProfile} onTaskClick={handleTaskClick} />;
            case 'communication':
                return <CommunicationView />;
            case 'earnings':
                return <EarningsView />;
            case 'profile':
                return <ProfileView userProfile={userProfile} />;
            default:
                return <DashboardView userProfile={userProfile} onTaskClick={handleTaskClick} />;
        }
    };
    
    const getHeaderText = () => {
        if(selectedTask) {
            return "Task Details";
        }
        const activeItem = navItems.find(item => item.id === activeView);
        return activeItem ? activeItem.label : 'Dashboard';
    }

    return (
        <div className="flex h-screen bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent font-sans text-slate-800">
            <aside className={`flex-shrink-0 bg-white/40 backdrop-blur-xl border-r border-slate-300/70 shadow-lg flex flex-col no-scrollbar transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className={`h-20 flex items-center flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'}`}>
                    {!sidebarCollapsed && <Logo />}
                     <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-full hover:bg-slate-500/10">
                        {sidebarCollapsed ? <Menu /> : <X />}
                    </button>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <NavItem 
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id && !selectedTask} 
                            onClick={() => {setSelectedTask(null); setActiveView(item.id);}}
                            collapsed={sidebarCollapsed}
                        />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-300/70 flex-shrink-0">
                    <button onClick={handleLogout} className={`group flex items-center w-full text-left px-4 py-3 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-500/10 hover:text-slate-900 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <span className={`text-slate-400 group-hover:text-slate-600 ${sidebarCollapsed ? '' : 'mr-3'}`}><LogOut /></span>
                        {!sidebarCollapsed && 'Logout'}
                    </button>
                </div>
            </aside>
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}>
                <header className="h-16 bg-white/60 backdrop-blur-lg border-b border-slate-300/70 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">{getHeaderText()}</h1>
                    <div className="font-semibold">{userProfile?.name || 'User'}</div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="animate-fadeIn" key={activeView + (selectedTask ? (selectedTask as any).id : '')}>
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ThumbnailMakerPanel;

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Clipboard, 
    MessageSquare, 
    IndianRupee, 
    UserCircle,
    LogOut,
    Sparkles
} from 'lucide-react';
import { useAuth, useCollection, useDoc, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';

import DashboardView from '@/components/video_editor/DashboardView';
import AssignedTasks from '@/components/video_editor/AssignedTasks';
import CommunicationView from '@/components/video_editor/CommunicationView';
import ContentSubmissionView from '@/components/video_editor/ContentSubmissionView';
import EarningsView from '@/components/video_editor/EarningsView';
import ProfileView from '@/components/video_editor/ProfileView';
import AIVideoStudio from '@/components/video_editor/AIVideoStudio';

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


// 🧩 NavItem Component — White Theme, Elegant Hover & Active States
const NavItem = ({ icon, label, active, onClick, ...props }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, [key: string]: any }) => (
    <motion.button
        {...props}
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active
                ? 'bg-slate-50 text-slate-800 border-r-2 border-slate-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
        }`}
        whileHover={{ x: 6 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className={`mr-3 ${active ? 'text-slate-700' : ''}`}>{icon}</span>
        {label}
    </motion.button>
);

// 🖥️ Main Panel — WHITE SIDEBAR GOD MODE ACTIVATED 😎
const VideoEditorPanel = () => {
    const router = useRouter();
    const { user } = useUser();
    const { auth, firestore } = useFirebase();
    const [activeView, setActiveView] = useState('dashboard');

    const userDocRef = useMemoFirebase(() => 
        user ? doc(firestore, 'users', user.uid) : null
    , [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);

    const workItemsQuery = useMemoFirebase(() => 
        user ? query(collection(firestore, 'work_items'), where('assignedTo', '==', user.uid), where('type', '==', 'video')) : null
    , [user, firestore]);
    const { data: tasks, isLoading: tasksLoading } = useCollection(workItemsQuery);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'assigned_tasks', label: 'Assigned Tasks', icon: <Clipboard size={18} /> },
        { id: 'ai_video_studio', label: 'AI Video Studio', icon: <Sparkles size={18} /> },
        { id: 'communication', label: 'Communication', icon: <MessageSquare size={18} /> },
        { id: 'earnings', label: 'Earnings', icon: <IndianRupee size={18} /> },
    ];

    const secondaryNavItems = [
        { id: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
    ];
    
    const handleLogout = async () => {
        if (auth) {
            await auth.signOut();
        }
        router.push('/login');
    };

    const renderView = () => {
        switch (activeView) {
            case 'assigned_tasks':
                return <AssignedTasks tasks={tasks || []} isLoading={tasksLoading} />;
            case 'ai_video_studio':
                return <AIVideoStudio />;
            case 'communication':
                return <CommunicationView />;
            case 'content_submission':
                return <ContentSubmissionView />;
            case 'earnings':
                return <EarningsView />;
            case 'profile':
                return <ProfileView userProfile={userProfile} />;
            case 'dashboard':
            default:
                return <DashboardView tasks={tasks || []} userProfile={userProfile} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* 👈 WHITE GOD-MODE SIDEBAR */}
            <aside className="w-64 flex-shrink-0 bg-white text-slate-800 flex flex-col no-scrollbar shadow-lg border-r border-slate-200">
                {/* 🔷 Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
                    <Logo />
                </div>

                {/* 🧭 Primary Navigation — Animated Entry */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.07, type: "tween", ease: "easeOut" }}
                        >
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={activeView === item.id}
                                onClick={() => setActiveView(item.id)}
                            />
                        </motion.div>
                    ))}
                </nav>

                {/* 🛠️ Secondary Nav + Logout */}
                <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0 space-y-3">
                    {secondaryNavItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (navItems.length + index) * 0.07, type: "tween", ease: "easeOut" }}
                        >
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={activeView === item.id}
                                onClick={() => setActiveView(item.id)}
                            />
                        </motion.div>
                    ))}

                    {/* 🚪 Logout — Classy Red Accent */}
                    <motion.button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                        whileHover={{ x: 6 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-3"><LogOut size={18} /></span>
                        Logout
                    </motion.button>
                </div>
            </aside>

            {/* ➡️ Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">{activeView.replace(/_/g, ' ')}</h1>
                    <div className="font-semibold text-slate-700">{userProfile?.name || 'User'}</div>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8">{renderView()}</main>
            </div>
        </div>
    );
};

export default VideoEditorPanel;

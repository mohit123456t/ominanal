'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Clipboard,
    MessageSquare,
    IndianRupee,
    UserCircle,
    LogOut,
    Menu,
    X,
    Sparkles,
} from 'lucide-react';
import DashboardView from '@/components/script_writer/DashboardView';
import TasksView from '@/components/script_writer/TasksView';
import PaymentsView from '@/components/script_writer/PaymentsView';
import ProfileView from '@/components/script_writer/ProfileView';
import CollaborationView from '@/components/script_writer/CollaborationView';
import AIScriptGeneratorView from '@/components/script_writer/AIScriptGeneratorView';
import { useAuth, useCollection, useFirebase, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';


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
        <h2 className="font-bold text-lg text-slate-800">TrendXoda</h2>
    </div>
);

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


const ScriptWriterPanel = () => {
    const router = useRouter();
    const { user } = useUser();
    const { auth } = useAuth();
    const { firestore } = useFirebase();

    const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);

    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const assignedTasksQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'work_items'), where('assignedTo', '==', user.uid), where('type', '==', 'script'));
    }, [user, firestore]);

    const { data: tasks, isLoading: tasksLoading } = useCollection(assignedTasksQuery);

    useEffect(() => {
        const savedView = localStorage.getItem('scriptWriterActiveView');
        if (savedView) {
            setActiveView(savedView);
        }
    }, []);
    
    useEffect(() => {
        localStorage.setItem('scriptWriterActiveView', activeView);
    }, [activeView]);

    const handleLogout = async () => {
        if(auth) await auth.signOut();
        router.push('/login');
    };

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView userProfile={userProfile} tasks={tasks || []} onTaskClick={() => setActiveView('tasks')} />;
            case 'tasks':
                return <TasksView tasks={tasks || []} isLoading={tasksLoading} />;
            case 'ai-generator':
                return <AIScriptGeneratorView />;
            case 'payments':
                return <PaymentsView userProfile={userProfile} />;
            case 'profile':
                return <ProfileView userProfile={userProfile} onProfileUpdate={() => {}} />;
            case 'collaboration':
                return <CollaborationView />;
            default:
                return <DashboardView userProfile={userProfile} tasks={tasks || []} onTaskClick={() => setActiveView('tasks')} />;
        }
    };
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={18} /> },
        { id: 'tasks', label: 'Tasks', icon: <Clipboard size={18} /> },
        { id: 'ai-generator', label: 'AI Script Generator', icon: <Sparkles size={18} /> },
        { id: 'payments', label: 'Payments', icon: <IndianRupee size={18} /> },
        { id: 'collaboration', label: 'Collaboration', icon: <MessageSquare size={18} /> },
    ];
    
     const secondaryNavItems = [
        { id: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
             <aside className="w-64 flex-shrink-0 bg-white text-slate-800 flex flex-col no-scrollbar shadow-lg border-r border-slate-200">
                <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
                    <Logo />
                </div>

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

export default ScriptWriterPanel;

'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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


const NavItem = ({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: ()=>void, collapsed: boolean }) => (
    <motion.button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active 
                ? 'bg-white/40 text-indigo-700 font-semibold' 
                : 'text-slate-700 hover:bg-white/20'
        }`}
        whileHover={{ x: active ? 0 : 5 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className={`mr-3 ${collapsed ? 'mx-auto' : ''} ${active ? 'text-indigo-600' : 'text-slate-600'}`}>{icon}</span>
        {!collapsed && <span>{label}</span>}
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
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart /> },
        { id: 'tasks', label: 'Tasks', icon: <Clipboard /> },
        { id: 'ai-generator', label: 'AI Script Generator', icon: <Sparkles /> },
        { id: 'payments', label: 'Payments', icon: <IndianRupee /> },
        { id: 'collaboration', label: 'Collaboration', icon: <MessageSquare /> },
        { id: 'profile', label: 'Profile', icon: <UserCircle /> },
    ];

    return (
        <div className="flex h-screen font-sans bg-slate-200 bg-gradient-to-br from-white via-blue-50 to-purple-50">
            <motion.aside 
                className={`flex-shrink-0 bg-white/40 backdrop-blur-xl flex flex-col z-50 shadow-2xl border-r border-slate-300/70 transition-all duration-300`}
                initial={{ width: '16rem' }}
                animate={{ width: sidebarCollapsed ? '5rem' : '16rem' }}
            >
                 <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
                    {!sidebarCollapsed && <h1 className="font-bold text-lg text-slate-800">Script Panel</h1>}
                    <button
                        onClick={() => setSidebarCollapsed(p => !p)}
                        className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-gray-100 transition-all"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarCollapsed ? <Menu /> : <X />}
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item, index) => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id}
                            onClick={() => setActiveView(item.id)}
                            collapsed={sidebarCollapsed}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <NavItem
                        icon={<LogOut />}
                        label="Logout"
                        active={false}
                        onClick={handleLogout}
                        collapsed={sidebarCollapsed}
                    />
                </div>
            </motion.aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <motion.header 
                    className="h-16 bg-white/60 backdrop-blur-lg border-b border-slate-300/70 flex items-center justify-between px-8 flex-shrink-0 shadow-sm"
                     initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <motion.h1
                        key={activeView}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xl font-bold text-slate-800 capitalize"
                    >
                        {activeView.replace(/_/g, ' ')}
                    </motion.h1>
                    <div className="flex items-center space-x-3">
                         <div className="relative flex items-center">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping absolute"></div>
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="font-semibold text-sm text-slate-700">{userProfile?.name}</div>
                    </div>
                </motion.header>
                
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default ScriptWriterPanel;

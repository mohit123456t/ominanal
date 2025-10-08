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
        </svg>
        <h2 className="font-bold text-lg text-slate-800">TrendXoda</h2>
    </div>
);

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <motion.button
        onClick={onClick}
        className={`relative flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            active
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
        }`}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className="mr-2">{icon}</span>
        {label}
        {active && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" layoutId="underline" />}
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
        <div className="min-h-screen bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent font-sans text-slate-800">
             <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-300/70">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <nav className="hidden md:flex items-center gap-2">
                             {navItems.map((item) => (
                                <NavItem
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    active={activeView === item.id}
                                    onClick={() => setActiveView(item.id)}
                                />
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={()=> setActiveView('profile')} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                               {userProfile?.name?.charAt(0) || 'S'}
                            </div>
                           <span className='hidden sm:inline'>{userProfile?.name || "Script Writer"}</span>
                       </button>
                         <motion.button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-500 hover:bg-slate-500/10 hover:text-slate-800 transition-all"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="mr-1.5"><LogOut size={16} /></span>
                            Logout
                        </motion.button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-6 lg:p-8">
                <motion.div
                     key={activeView}
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -15 }}
                     transition={{ duration: 0.25 }}
                >
                    {renderView()}
                </motion.div>
            </main>
        </div>
    );
};

export default ScriptWriterPanel;

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
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            active 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:bg-gray-100 hover:text-slate-900'
        } ${collapsed ? 'justify-center' : ''}`
    }
        aria-label={label}
        tabIndex={0}
    >
        <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
        {!collapsed && <span>{label}</span>}
    </button>
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

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside 
                className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
                    sidebarCollapsed ? 'w-20' : 'w-64'
                } flex flex-col flex-shrink-0`}
            >
                {/* Logo and collapse button */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    {!sidebarCollapsed && <h1 className="font-bold text-lg text-slate-800">Script Panel</h1>}
                    <button
                        onClick={() => setSidebarCollapsed(p => !p)}
                        className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-gray-100 transition-all"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarCollapsed ? <Menu /> : <X />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: <BarChart /> },
                        { id: 'tasks', label: 'Tasks', icon: <Clipboard /> },
                        { id: 'ai-generator', label: 'AI Script Generator', icon: <Sparkles /> },
                        { id: 'payments', label: 'Payments', icon: <IndianRupee /> },
                        { id: 'collaboration', label: 'Collaboration', icon: <MessageSquare /> },
                        { id: 'profile', label: 'Profile', icon: <UserCircle /> },
                    ].map(item => (
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

                {/* Logout section */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-slate-500 hover:bg-red-50 hover:text-red-600 ${
                            sidebarCollapsed ? 'justify-center' : ''
                        }`}
                    >
                        <span className={sidebarCollapsed ? '' : 'mr-3'}><LogOut /></span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-slate-800 capitalize">
                            {activeView.replace(/_/g, ' ').replace(/-/g, ' ')}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                         <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                                {userProfile?.name?.charAt(0).toUpperCase()}
                            </div>
                             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                             <p className="text-sm font-semibold text-slate-800">{userProfile?.name}</p>
                             <p className="text-xs text-slate-500">{userProfile?.role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                        </div>
                    </div>
                </header>
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default ScriptWriterPanel;

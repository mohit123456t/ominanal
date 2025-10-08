'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
        </svg>
        <h2 className="font-bold text-lg text-slate-800">TrendXoda</h2>
    </div>
);


const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <motion.button
        onClick={onClick}
        className={`relative flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
            active
                ? 'text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className="mr-2">{icon}</span>
        {label}
        {active && (
            <motion.div
                className="absolute inset-0 bg-white/60 rounded-lg -z-10"
                layoutId="video-editor-active-nav-pill"
                transition={{ type: 'spring', stiffness: 170, damping: 25 }}
            />
        )}
    </motion.button>
);


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
        <div className="min-h-screen bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent font-sans text-slate-800">
             <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-slate-300/70">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <nav className="hidden md:flex items-center gap-2 p-1 bg-black/5 rounded-xl">
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
                               {userProfile?.name?.charAt(0) || 'V'}
                            </div>
                           <span className='hidden sm:inline'>{userProfile?.name || "Video Editor"}</span>
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
            </main>
        </div>
    );
};

export default VideoEditorPanel;

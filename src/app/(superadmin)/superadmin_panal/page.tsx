'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  ImageIcon,
  Video,
  LogOut,
  Briefcase,
  IndianRupee,
  Pencil,
  Tag,
  Users as UsersGroup,
  ArrowLeft,
  Plus,
  ChartBar,
  Clipboard,
  UserCircle,
  Contact,
} from 'lucide-react';
import { useAuth, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';

import SuperAdminDashboard from '@/components/superadmin/SuperAdminDashboard';
import SuperAdminFinance from '@/components/superadmin/SuperAdminFinance';
import PricingManagement from '@/components/superadmin/PricingManagement';
import StaffManagementView from '@/components/superadmin/StaffManagementView';
import VideoEditorManagerView from '@/components/superadmin/VideoEditorManagerView';
import ThumbnailMakerManagerView from '@/components/superadmin/ThumbnailMakerManagerView';
import UploaderManagerView from '@/components/superadmin/UploaderManagerView';
import ScriptWriterManagerView from '@/components/superadmin/ScriptWriterManagerView';
import ReelsUploadedPage from '@/components/superadmin/ReelsUploadedPage';
import SuperAdminProfileView from '@/components/superadmin/SuperAdminProfileView';
import LeadsPanel from '@/components/superadmin/LeadsPanel';


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
                layoutId="superadmin-active-nav-pill"
                transition={{ type: 'spring', stiffness: 170, damping: 25 }}
            />
        )}
    </motion.button>
);


function SuperAdminPanel() {
    const [activeView, setActiveView] = useState('dashboard');
    const router = useRouter();
    const { user } = useAuth();
    const { firestore } = useFirebase();

    const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: usersData, isLoading: usersLoading } = useCollection(usersCollection);

    const postsCollectionGroup = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'posts')) : null, [firestore]);
    const { data: postsData, isLoading: postsLoading } = useCollection(postsCollectionGroup);
    
    const isLoading = usersLoading || postsLoading;

    const handleLogout = async () => {
        router.push('/login');
    };

    const renderView = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>;
        }
        switch (activeView) {
            case 'dashboard': return <SuperAdminDashboard users={usersData || []} posts={postsData || []} />;
            case 'staff_management': return <StaffManagementView />;
            case 'uploader_manager': return <UploaderManagerView />;
            case 'script_writer_manager': return <ScriptWriterManagerView />;
            case 'thumbnail_maker_manager': return <ThumbnailMakerManagerView />;
            case 'video_editor_manager': return <VideoEditorManagerView />;
            case 'reels_uploaded': return <ReelsUploadedPage />;
            case 'finance': return <SuperAdminFinance posts={postsData || []} onNavigate={setActiveView} />;
            case 'pricing_management': return <PricingManagement />;
            case 'profile': return <SuperAdminProfileView />;
            case 'leads_panel': return <LeadsPanel />;
            default: return <SuperAdminDashboard users={usersData || []} posts={postsData || []} />;
        }
    };

     const superAdminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { id: 'finance', label: 'Finance', icon: <IndianRupee size={16} /> },
        { id: 'staff_management', label: 'Staff', icon: <UsersGroup size={16} /> },
        { id: 'leads_panel', label: 'Leads', icon: <Contact size={16} /> },
        { id: 'uploader_manager', label: 'Uploaders', icon: <Upload size={16} /> },
        { id: 'script_writer_manager', label: 'Writers', icon: <Pencil size={16} /> },
        { id: 'thumbnail_maker_manager', label: 'Thumbnails', icon: <ImageIcon size={16} /> },
        { id: 'video_editor_manager', label: 'Editors', icon: <Video size={16} /> },
        { id: 'reels_uploaded', label: 'Reels', icon: <FileText size={16} /> },
    ];
    
    const adminProfileName = user?.displayName || 'Super Admin';

    return (
       <div className="min-h-screen bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent font-sans text-slate-800">
             <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-slate-300/70">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <nav className="hidden md:flex items-center gap-1 p-1 bg-black/5 rounded-xl overflow-x-auto">
                             {superAdminNavItems.map((item) => (
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
                               {adminProfileName?.charAt(0) || 'S'}
                            </div>
                           <span className='hidden sm:inline'>{adminProfileName}</span>
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

export default function SuperAdminPanelPage() {
    return <SuperAdminPanel />;
}

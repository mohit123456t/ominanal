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
  ChevronDown,
} from 'lucide-react';
import { useAuth, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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

const NavItem = ({ icon, label, active, onClick, children }: { icon?: React.ReactNode, label: string, active: boolean, onClick: () => void, children?: React.ReactNode }) => (
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
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {children}
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

    const postsData: any[] = [];
    const postsLoading = false;
    
    const isLoading = usersLoading || postsLoading;

    const handleLogout = async () => {
        router.push('/login');
    };

    const renderView = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>;
        }
        switch (activeView) {
            case 'dashboard': return <SuperAdminDashboard users={usersData || []} />;
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
            default: return <SuperAdminDashboard users={usersData || []} />;
        }
    };

    const isManagerViewActive = [
        'uploader_manager', 'script_writer_manager', 
        'thumbnail_maker_manager', 'video_editor_manager'
    ].includes(activeView);

    const adminProfileName = user?.displayName || 'Super Admin';

    return (
       <div className="min-h-screen bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent font-sans text-slate-800">
             <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-slate-300/70">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <nav className="hidden md:flex items-center gap-1 p-1 bg-black/5 rounded-xl">
                            <NavItem
                                key="dashboard"
                                icon={<LayoutDashboard size={16} />}
                                label="Dashboard"
                                active={activeView === 'dashboard'}
                                onClick={() => setActiveView('dashboard')}
                            />
                            <NavItem
                                key="finance"
                                icon={<IndianRupee size={16} />}
                                label="Finance"
                                active={activeView === 'finance'}
                                onClick={() => setActiveView('finance')}
                            />
                            <NavItem
                                key="staff_management"
                                icon={<UsersGroup size={16} />}
                                label="Staff"
                                active={activeView === 'staff_management'}
                                onClick={() => setActiveView('staff_management')}
                            />
                             <NavItem
                                key="leads_panel"
                                icon={<Contact size={16} />}
                                label="Leads"
                                active={activeView === 'leads_panel'}
                                onClick={() => setActiveView('leads_panel')}
                            />

                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                     <div
                                        className={`relative flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 cursor-pointer ${
                                            isManagerViewActive
                                                ? 'text-slate-900 font-semibold'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Staff Managers <ChevronDown size={16} className="ml-1" />
                                        {isManagerViewActive && (
                                            <motion.div
                                                className="absolute inset-0 bg-white/60 rounded-lg -z-10"
                                                layoutId="superadmin-active-nav-pill"
                                                transition={{ type: 'spring', stiffness: 170, damping: 25 }}
                                            />
                                        )}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white/70 backdrop-blur-lg border-slate-300/50">
                                    <DropdownMenuItem onClick={() => setActiveView('uploader_manager')}>Uploaders</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setActiveView('script_writer_manager')}>Writers</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setActiveView('thumbnail_maker_manager')}>Thumbnail Makers</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setActiveView('video_editor_manager')}>Video Editors</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <NavItem
                                key="reels_uploaded"
                                icon={<FileText size={16} />}
                                label="Reels"
                                active={activeView === 'reels_uploaded'}
                                onClick={() => setActiveView('reels_uploaded')}
                            />
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

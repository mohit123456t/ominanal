'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Upload,
    MessageSquare,
    IndianRupee,
    UserCircle,
    LogOut,
    Menu,
    X,
    FilePlus,
    KeyRound,
    Link2,
} from 'lucide-react';

import DashboardView from '@/components/uploader/DashboardView';
import UploadHistoryView from '@/components/uploader/UploadHistoryView';
import PaymentsView from '@/components/uploader/PaymentsView';
import CommunicationView from '@/components/uploader/CommunicationView';
import ProfileView from '@/components/uploader/ProfileView';
import UploadView from '@/components/uploader/UploadView';
import ApiKeysView from '@/components/uploader/ApiKeysView';
import ConnectedAccountsView from '@/components/uploader/ConnectedAccountsView';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, useDoc, useFirebase } from '@/firebase';
import { PlatformCredentials, SocialMediaAccount, Post } from '@/lib/types';


const NavItem = ({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: ()=>void, collapsed: boolean }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            active 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:bg-gray-100 hover:text-slate-900'
        } ${collapsed ? 'justify-center' : ''}`}
    >
        <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
        {!collapsed && <span>{label}</span>}
    </button>
);

const UploaderPanel = () => {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const { auth, firestore } = useFirebase();

    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const credsCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'platformCredentials');
    }, [user, firestore]);
    
    const { data: credentialsList, isLoading: isLoadingCreds } = useCollection<PlatformCredentials>(credsCollectionRef);

    const accountsCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/socialMediaAccounts`);
    }, [user, firestore]);

    const { data: accounts, isLoading: isLoadingAccounts } = useCollection<SocialMediaAccount>(accountsCollectionRef);

    const postsCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/posts`);
    }, [user, firestore]);
    
    const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsCollectionRef);


    useEffect(() => {
        if (!isUserLoading && !user) {
             router.push('/login');
        }
        const savedView = localStorage.getItem('uploaderActiveView');
        if (savedView) {
            setActiveView(savedView);
        }
    }, [isUserLoading, user, router]);
    
    useEffect(() => {
        localStorage.setItem('uploaderActiveView', activeView);
    }, [activeView]);

    const handleLogout = async () => {
        if (auth) {
            await auth.signOut();
        }
        router.push('/login');
    };
    
    const isLoading = isProfileLoading || isLoadingCreds || isLoadingAccounts || isLoadingPosts;

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView userProfile={userProfile} onNavigate={(view) => setActiveView(view)} posts={posts || []} isLoading={isLoadingPosts} />;
            case 'create-upload':
                return <UploadView />;
            case 'upload-history':
                return <UploadHistoryView posts={posts || []} isLoading={isLoadingPosts} />;
            case 'api-keys':
                return <ApiKeysView credentialsList={credentialsList || []} isLoadingCreds={isLoadingCreds} accounts={accounts || []} />;
            case 'connected-accounts':
                return <ConnectedAccountsView accounts={accounts || []} credentialsList={credentialsList || []} isLoading={isLoadingAccounts || isLoadingCreds} />;
            case 'payments':
                return <PaymentsView posts={posts || []} />;
            case 'communication':
                return <CommunicationView userProfile={userProfile} />;
            case 'profile':
                return <ProfileView userProfile={userProfile} />;
            default:
                return <DashboardView userProfile={userProfile} onNavigate={(view) => setActiveView(view)} posts={posts || []} isLoading={isLoadingPosts} />;
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
        { id: 'create-upload', label: 'Create Upload', icon: <FilePlus /> },
        { id: 'upload-history', label: 'Upload History', icon: <Upload /> },
        { id: 'api-keys', label: 'API Keys', icon: <KeyRound /> },
        { id: 'connected-accounts', label: 'Connected Accounts', icon: <Link2 /> },
        { id: 'payments', label: 'Payments', icon: <IndianRupee /> },
        { id: 'communication', label: 'Communication', icon: <MessageSquare /> },
        { id: 'profile', label: 'Profile', icon: <UserCircle /> },
    ];

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
                    {!sidebarCollapsed && <h1 className="font-bold text-lg text-slate-800">Uploader Panel</h1>}
                    <button
                        onClick={() => setSidebarCollapsed(p => !p)}
                        className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-gray-100 transition-all"
                    >
                        {sidebarCollapsed ? <Menu /> : <X />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center font-bold text-white">
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
                    {isLoading && !userProfile ? <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="animate-spin h-10 w-10 text-primary" /></div> : renderView()}
                </div>
            </main>
        </div>
    );
};

export default UploaderPanel;

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Folder,
  CheckCircle,
  Users as UsersGroup,
  Wallet,
  Bell,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuth, useCollection, useFirebase, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, doc, collectionGroup, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

import CampaignApprovalView from '@/components/admin/CampaignApprovalView';
import CampaignDetailView from '@/components/admin/CampaignDetailView';
import CampaignManagerView from '@/components/admin/CampaignManagerView';
import ProfileView from '@/components/admin/ProfileView';
import UserManagementView from '@/components/admin/UserManagementView';
import PlaceholderView from '@/components/admin/PlaceholderView';
import FinanceView from '@/components/admin/FinanceView';
import EarningsView from '@/components/admin/EarningsView';
import DashboardView from '@/components/admin/DashboardView';

const BrandPanel = ({ viewBrandId, onBack }: { viewBrandId: string | null; onBack: () => void; }) => (
    <div>
        <button onClick={onBack} className="flex items-center mb-4 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Management
        </button>
        <PlaceholderView name={`Brand Panel (ID: ${viewBrandId})`} />
    </div>
);

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
        <h2 className="font-bold text-lg text-slate-800">Admin Panel</h2>
    </div>
);

const NavItem = ({ icon, label, active, onClick, index }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, index: number }) => (
    <motion.button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active
                ? 'bg-white/40 text-indigo-700 font-semibold'
                : 'text-slate-700 hover:bg-white/20'
        }`}
        whileHover={{ x: active ? 0 : 5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 + index * 0.07, type: "spring", stiffness: 150, damping: 20 }}
    >
        <span className={`mr-3 ${active ? 'text-indigo-600' : 'text-slate-600'}`}>{icon}</span>
        {label}
    </motion.button>
);

function AdminPanel() {
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    const router = useRouter();
    const { user, auth } = useAuth();
    const { firestore } = useFirebase();
    const { toast } = useToast();

    // Data Fetching Hooks
    const userDocRef = useMemoFirebase(() =>
        user && firestore ? doc(firestore, 'users', user.uid) : null
    , [user, firestore]);
    const { data: adminProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
    
    const campaignsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'campaigns') : null, [firestore]);
    const { data: campaigns, isLoading: campaignsLoading } = useCollection(campaignsQuery);

    const transactionsQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'transactions')) : null, [firestore]);
    const { data: transactions, isLoading: transactionsLoading } = useCollection(transactionsQuery);

    const brands = useMemo(() => users?.filter(u => u.role === 'brand') || [], [users]);
    
    const adminProfileName = adminProfile?.name || 'Admin';
    
    const handleUpdateTransactionStatus = async (transaction: any, newStatus: string) => {
        if (!firestore || !transaction.brandId || !transaction.id) {
            toast({ variant: 'destructive', title: "Error", description: "Invalid transaction data or database connection." });
            return;
        }

        const transactionDocRef = doc(firestore, `users/${transaction.brandId}/transactions`, transaction.id);
        
        try {
            await updateDoc(transactionDocRef, { status: newStatus });
            if (newStatus === 'Completed' && transaction.type === 'DEPOSIT') {
                const userDocRef = doc(firestore, 'users', transaction.brandId);
                const { runTransaction, getDoc } = await import('firebase/firestore');
                await runTransaction(firestore, async (dbTransaction) => {
                    const userDoc = await dbTransaction.get(userDocRef);
                    if (!userDoc.exists()) {
                        throw new Error("User document not found!");
                    }
                    const newBalance = (userDoc.data().balance || 0) + transaction.amount;
                    dbTransaction.update(userDocRef, { balance: newBalance });
                });
            }
            toast({ title: 'Success', description: `Transaction status updated to ${newStatus}.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Update Failed", description: error.message });
            console.error("Error updating transaction:", error);
        }
    };


    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'campaigns', label: 'Campaigns', icon: <Folder size={18} /> },
        { id: 'campaign-approval', label: 'Campaign Approval', icon: <CheckCircle size={18} /> },
        { id: 'users', label: 'User Management', icon: <UsersGroup size={18} /> },
        { id: 'finance', label: 'Finance', icon: <Wallet size={18} /> },
        { id: 'communication', label: 'Communication', icon: <Bell size={18} /> },
    ];

    const handleLogout = async () => {
        try {
            if(auth) {
               await auth.signOut();
            }
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        }
    };

    const handleSelectCampaign = (id: string) => {
        setSelectedCampaignId(id);
        setActiveView('campaign_detail');
    };
    
    const onViewBrand = (brandId: string) => {
        setSelectedBrandId(brandId);
        setActiveView('brand_view');
    };

    const isLoading = usersLoading || campaignsLoading || transactionsLoading || isProfileLoading;

    const renderView = () => {
        if (isLoading) {
            return <div className="flex h-full w-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
        }

        if (selectedCampaignId && activeView === 'campaign_detail') {
            return <CampaignDetailView campaignId={selectedCampaignId} onClose={() => { setSelectedCampaignId(null); setActiveView('campaigns'); }} />;
        }
        
        switch (activeView) {
            case 'profile': return <ProfileView profile={adminProfile} />;
            case 'campaigns': return <CampaignManagerView campaigns={campaigns || []} users={users || []} onSelectCampaign={handleSelectCampaign} />;
            case 'campaign-approval': return <CampaignApprovalView campaigns={campaigns || []} />;
            case 'users': return <UserManagementView brands={brands || []} onViewBrand={onViewBrand} />;
            case 'finance': return <FinanceView transactions={transactions || []} setView={setActiveView} onUpdateStatus={handleUpdateTransactionStatus} />;
            case 'earnings': return <EarningsView campaigns={campaigns || []} setView={setActiveView} />; 
            case 'communication': return <PlaceholderView name="Communication" />;
            case 'brand_view': return <BrandPanel viewBrandId={selectedBrandId} onBack={() => setActiveView('users')} />;
            case 'dashboard':
            default:
                return <DashboardView campaigns={campaigns || []} users={users || []} />;
        }
    };

    return (
        <div className="flex h-screen font-sans bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent">
            <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed left-0 top-0 h-full w-64 bg-white/40 backdrop-blur-xl text-slate-800 flex flex-col z-50 shadow-2xl border-r border-slate-300/70"
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-300/70 flex-shrink-0">
                    <Logo />
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <NavItem
                            key={item.id}
                            index={index}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id || (item.id === 'finance' && activeView === 'earnings')}
                            onClick={() => {
                                setSelectedCampaignId(null);
                                setActiveView(item.id);
                            }}
                        />
                    ))}
                </nav>
                <div className="px-4 py-6 border-t border-slate-300/70 flex-shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <motion.span className="mr-3" whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} >
                            <LogOut size={18} />
                        </motion.span>
                        Logout
                    </motion.button>
                     <motion.button
                        onClick={() => router.push('/login')}
                        className="mt-2 flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-white/20 transition-all"
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-3"><ArrowLeft size={18}/></span>
                        Back to App
                    </motion.button>
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="h-16 bg-white/60 backdrop-blur-lg border-b border-slate-300/70 flex items-center justify-between px-8 flex-shrink-0 shadow-sm"
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
                        <div className="font-semibold text-sm text-slate-700">{adminProfileName}</div>
                    </div>
                </motion.header>

                <main className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="p-8"
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default function AdminPanelPage() {
    return <AdminPanel />;
}
    
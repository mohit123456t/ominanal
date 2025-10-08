'use client';
import React, { useState, useMemo, useEffect } from 'react';
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
import { collection, query, doc, collectionGroup, updateDoc, addDoc, serverTimestamp, setDoc, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

import CampaignApprovalView from '@/components/admin/CampaignApprovalView';
import CampaignDetailView from '@/components/admin/CampaignDetailView';
import CampaignManagerView from '@/components/admin/CampaignManagerView';
import ProfileView from '@/components/admin/ProfileView';
import UserManagementView from '@/components/admin/UserManagementView';
import BrandDetailView from '@/components/admin/BrandDetailView';
import FinanceView from '@/components/admin/FinanceView';
import EarningsView from '@/components/admin/EarningsView';
import DashboardView from '@/components/admin/DashboardView';


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
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className="mr-2">{icon}</span>
        {label}
        {active && (
            <motion.div
                className="absolute inset-0 bg-indigo-500/10 rounded-lg -z-10"
                layoutId="admin-active-nav-pill"
                transition={{ type: 'spring', stiffness: 170, damping: 25 }}
            />
        )}
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
    const { data: adminProfile, isLoading: isProfileLoading, error: profileError } = useDoc(userDocRef);

    // Auto-create admin profile if it doesn't exist
    useEffect(() => {
        const createAdminProfileIfNeeded = async () => {
            if (user && !isProfileLoading && !adminProfile && userDocRef) {
                // Check one more time to avoid race conditions
                 const { getDoc } = await import('firebase/firestore');
                 const docSnap = await getDoc(userDocRef);
                 if (!docSnap.exists()) {
                     console.log("Admin profile does not exist, creating one...");
                     try {
                         await setDoc(userDocRef, {
                             uid: user.uid,
                             email: user.email,
                             name: user.displayName || 'Admin User',
                             role: 'admin',
                             createdAt: serverTimestamp(),
                         });
                         toast({ title: 'Profile Created', description: 'Your admin profile has been initialized.' });
                     } catch (e: any) {
                         console.error("Failed to create admin profile:", e);
                         toast({ variant: 'destructive', title: 'Profile Creation Failed', description: e.message });
                     }
                 }
            }
        };
        createAdminProfileIfNeeded();
    }, [user, adminProfile, isProfileLoading, userDocRef, firestore, toast]);

    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
    
    const campaignsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'campaigns') : null, [firestore]);
    const { data: campaigns, isLoading: campaignsLoading } = useCollection(campaignsQuery);

    const expensesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'expenses')) : null, [firestore]);
    const { data: expenses, isLoading: expensesLoading } = useCollection(expensesQuery);
    
    const allTransactions: any[] = [];
    const transactionsLoading = false;


    const brands = useMemo(() => users?.filter(u => u.role === 'brand') || [], [users]);
    
    const adminProfileName = adminProfile?.name || user?.displayName || 'Admin';
    
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
    
    const handleAddExpense = async (expenseData: { description: string; amount: number; date: string; }) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: "Error", description: "Database not available." });
            return false;
        }
        try {
            const expensesCollection = collection(firestore, 'expenses');
            await addDoc(expensesCollection, {
                ...expenseData,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Success', description: 'Expense has been recorded.' });
            return true;
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: `Failed to add expense: ${error.message}` });
            return false;
        }
    };


    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'campaigns', label: 'Campaigns', icon: <Folder size={18} /> },
        { id: 'campaign-approval', label: 'Campaign Approval', icon: <CheckCircle size={18} /> },
        { id: 'users', label: 'User Management', icon: <UsersGroup size={18} /> },
        { id: 'finance', label: 'Finance', icon: <Wallet size={18} /> },
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

    const isLoading = usersLoading || campaignsLoading || isProfileLoading || expensesLoading || transactionsLoading;

    const renderView = () => {
        if (isLoading && !adminProfile) { // Show loading only on initial load
            return <div className="flex h-full w-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
        }

        if (selectedCampaignId && activeView === 'campaign_detail') {
            return <CampaignDetailView campaignId={selectedCampaignId} onClose={() => { setSelectedCampaignId(null); setActiveView('campaigns'); }} />;
        }

        if (selectedBrandId && activeView === 'brand_view') {
            return <BrandDetailView brandId={selectedBrandId} onBack={() => { setSelectedBrandId(null); setActiveView('users'); }} />;
        }
        
        switch (activeView) {
            case 'profile': return <ProfileView profile={adminProfile} />;
            case 'campaigns': return <CampaignManagerView campaigns={campaigns || []} users={users || []} onSelectCampaign={handleSelectCampaign} />;
            case 'campaign-approval': return <CampaignApprovalView campaigns={campaigns || []} />;
            case 'users': return <UserManagementView brands={brands || []} onViewBrand={onViewBrand} />;
            case 'finance': return <FinanceView transactions={allTransactions || []} expenses={expenses || []} onUpdateStatus={handleUpdateTransactionStatus} onAddExpense={handleAddExpense} />;
            case 'earnings': return <EarningsView campaigns={campaigns || []} setView={setActiveView} />; 
            case 'dashboard':
            default:
                return <DashboardView campaigns={campaigns || []} users={users || []} expenses={expenses || []} />;
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
                                    active={activeView === item.id || (item.id === 'finance' && activeView === 'earnings')}
                                    onClick={() => {
                                        setSelectedCampaignId(null);
                                        setSelectedBrandId(null);
                                        setActiveView(item.id);
                                    }}
                                />
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={()=> setActiveView('profile')} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                               {adminProfile?.name?.charAt(0) || 'A'}
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
                        key={activeView + (selectedBrandId || '')}
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

export default function AdminPanelPage() {
    return <AdminPanel />;
}
    

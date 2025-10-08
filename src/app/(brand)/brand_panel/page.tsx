'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Folder,
    DollarSign,
    UserCircle,
    BarChart3,
    Wallet,
    HelpCircle,
    LogOut,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import DashboardView from '@/components/brand/DashboardView';
import CampaignsView from '@/components/brand/CampaignsView';
import AnalyticsView from '@/components/brand/AnalyticsView';
import BillingView from '@/components/brand/BillingView';
import SupportView from '@/components/brand/SupportView';
import ProfileView from '@/components/brand/ProfileView';
import CampaignDetailView from '@/components/brand/CampaignDetailView';
import NewCampaignForm from '@/components/brand/NewCampaignForm';
import OrderForm from '@/components/brand/OrderForm';
import PricingView from '@/components/brand/PricingView';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, updateDoc, arrayUnion, setDoc, collection, query, where } from 'firebase/firestore';

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
                layoutId="brand-active-nav-pill"
                transition={{ type: 'spring', stiffness: 170, damping: 25 }}
            />
        )}
    </motion.button>
);

const BrandPanel = () => {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);

    const userDocRef = useMemoFirebase(() => {
        if (user && firestore) {
            return doc(firestore, 'users', user.uid);
        }
        return null;
    }, [user, firestore]);

    const { data: brandData, isLoading: isDataLoading } = useDoc(userDocRef);

    const campaignsQuery = useMemoFirebase(() => {
        if (user && firestore) {
            return query(collection(firestore, 'campaigns'), where('brandId', '==', user.uid));
        }
        return null;
    }, [user, firestore]);

    const { data: campaigns, isLoading: campaignsLoading } = useCollection(campaignsQuery);

    const orders = useMemo(() => brandData?.orders || [], [brandData]);
    const profile = useMemo(() => brandData, [brandData]);


    useEffect(() => {
        const savedView = localStorage.getItem('brandActiveView');
        if (savedView) setActiveView(savedView);
    }, []);

    useEffect(() => {
        localStorage.setItem('brandActiveView', activeView);
    }, [activeView]);

    const handleLogout = () => {
        router.push('/login');
    };

    const handleSelectCampaign = (campaign: any) => {
        setSelectedCampaign(campaign);
        setActiveView('campaign_detail');
    };
    
    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setActiveView('campaigns');
    };

    const handleCreateOrder = async (newOrderData: any) => {
       if (!userDocRef) return;
        try {
            const orderWithMeta = {
                ...newOrderData,
                id: `order_${Date.now()}`,
                userId: user?.uid,
                createdAt: new Date().toISOString(),
                status: 'Pending',
            };
            await updateDoc(userDocRef, {
                orders: arrayUnion(orderWithMeta)
            });
            setShowOrderForm(false);
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const handleUpdateProfile = async (updatedProfile: any) => {
        if (!userDocRef) return;
        try {
            // Exclude arrays from the top-level setDoc to avoid replacing them
            const { campaigns, orders, ...profileData } = updatedProfile;
            await setDoc(userDocRef, profileData, { merge: true });
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleCancelNewCampaign = () => setShowNewCampaignForm(false);
    const handleCreateOrderForCampaign = (campaign: any) => {
        setSelectedCampaign(campaign);
        setShowOrderForm(true);
    };
    const handleCancelOrder = () => setShowOrderForm(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
        { id: 'campaigns', label: 'Campaigns', icon: <Folder /> },
        { id: 'pricing', label: 'Pricing', icon: <DollarSign /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 /> },
        { id: 'billing', label: 'Billing', icon: <Wallet /> },
    ];
    
     const secondaryNavItems = [
        { id: 'support', label: 'Support', icon: <HelpCircle /> },
    ];


    const renderView = () => {
        const isLoading = isDataLoading || isUserLoading || campaignsLoading;

        if (isLoading) {
            return <div className="text-center p-8">Loading...</div>;
        }

        if (selectedCampaign && activeView === 'campaign_detail') {
            return <CampaignDetailView campaignId={selectedCampaign.id} onClose={handleBackToCampaigns} onCreateOrder={() => setShowOrderForm(true)} />;
        }
        switch (activeView) {
            case 'campaigns':
                return <CampaignsView campaigns={campaigns || []} onSelectCampaign={handleSelectCampaign} onNewCampaign={() => setShowNewCampaignForm(true)} onCreateOrder={handleCreateOrderForCampaign} />;
            case 'pricing': return <PricingView />;
            case 'analytics': return <AnalyticsView campaigns={campaigns || []} />;
            case 'billing': return <BillingView user={user} />;
            case 'support': return <SupportView user={user} campaigns={campaigns || []} />;
            case 'profile': return <ProfileView user={user} profile={profile} onUpdateProfile={handleUpdateProfile} />;
            case 'dashboard':
            default:
                return <DashboardView campaigns={campaigns || []} profile={profile} onNewCampaign={() => setShowNewCampaignForm(true)} onNavigateToAnalytics={() => setActiveView('analytics')} onNavigateToCampaigns={() => setActiveView('campaigns')} />;
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
                                    onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                                />
                            ))}
                            {secondaryNavItems.map((item) => (
                                 <NavItem
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    active={activeView === item.id}
                                    onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                                />
                            ))}
                        </nav>
                    </div>
                     <div className="flex items-center gap-4">
                       <button onClick={()=> setActiveView('profile')} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                               {profile?.name?.charAt(0) || 'B'}
                            </div>
                           <span className='hidden sm:inline'>{profile?.name || "Brand"}</span>
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
            
             <AnimatePresence>
                {showNewCampaignForm && (
                     <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                             className="w-full max-w-2xl rounded-2xl border border-slate-300/70 bg-slate-100/80 shadow-2xl backdrop-blur-xl"
                             initial={{ scale: 0.95 }}
                             animate={{ scale: 1 }}
                             exit={{ scale: 0.95 }}
                        >
                            <NewCampaignForm
                                onCampaignCreated={() => setShowNewCampaignForm(false)}
                                onCancel={handleCancelNewCampaign}
                            />
                        </motion.div>
                    </motion.div>
                )}
                {showOrderForm && selectedCampaign && (
                     <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                             className="w-full max-w-2xl rounded-2xl border border-slate-300/70 bg-slate-100/80 shadow-2xl backdrop-blur-xl"
                             initial={{ scale: 0.95 }}
                             animate={{ scale: 1 }}
                             exit={{ scale: 0.95 }}
                        >
                            <OrderForm
                                campaign={selectedCampaign}
                                onCreateOrder={handleCreateOrder}
                                onCancel={handleCancelOrder}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandPanel;

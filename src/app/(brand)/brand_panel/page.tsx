'use client';
import React, { useState, useEffect } from 'react';
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
    Menu,
    X,
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, setDoc } from 'firebase/firestore';

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
        <h2 className="font-bold text-lg text-slate-800">Brand Panel</h2>
    </div>
);


const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: ()=>void }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-blue-100/50 text-blue-700 border border-blue-200/80' : 'text-slate-700 hover:bg-white/30 hover:text-slate-900'} ${!label ? 'justify-center' : ''}`}
        aria-label={label || 'Sidebar item'}
        tabIndex={0}
    >
        <span className="mr-3">{icon}</span>
        {label ? <span>{label}</span> : null}
    </button>
);

const BrandPanel = () => {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [activeView, setActiveView] = useState('dashboard');
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);

    // Fetch campaigns
    const campaignsCollection = useMemoFirebase(() => 
        user && firestore ? collection(firestore, `users/${user.uid}/campaigns`) : null,
        [user, firestore]
    );
    const { data: campaigns, isLoading: campaignsLoading } = useCollection(campaignsCollection);

    // Fetch orders
    const ordersCollection = useMemoFirebase(() =>
        user && firestore ? collection(firestore, `users/${user.uid}/orders`) : null,
        [user, firestore]
    );
    const { data: orders, isLoading: ordersLoading } = useCollection(ordersCollection);

    // Fetch profile
    const profileDoc = useMemoFirebase(() => 
        user && firestore ? doc(firestore, `users/${user.uid}`) : null,
        [user, firestore]
    );
    const { data: profile, isLoading: profileLoading } = useCollection(profileDoc);


    useEffect(() => {
        const savedView = localStorage.getItem('brandActiveView');
        if (savedView) setActiveView(savedView);
    }, []);

    useEffect(() => {
        localStorage.setItem('brandActiveView', activeView);
    }, [activeView]);

    const handleLogout = () => {
        // Replace with your actual logout logic
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

    const handleCreateCampaign = async (newCampaignData: any) => {
        if (!user || !campaignsCollection) return;
        try {
            await addDoc(campaignsCollection, {
                ...newCampaignData,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                status: 'Pending Approval', // Default status
            });
            setShowNewCampaignForm(false);
        } catch (error) {
            console.error("Error creating campaign:", error);
        }
    };

    const handleCreateOrder = async (newOrderData: any) => {
       if (!user || !ordersCollection) return;
        try {
            await addDoc(ordersCollection, {
                ...newOrderData,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                status: 'Pending',
            });
            setShowOrderForm(false);
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const handleUpdateProfile = async (updatedProfile: any) => {
        if (!profileDoc) return;
        try {
            await setDoc(profileDoc, updatedProfile, { merge: true });
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
    const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
        { id: 'campaigns', label: 'Campaigns', icon: <Folder /> },
        { id: 'pricing', label: 'Pricing', icon: <DollarSign /> },
        { id: 'profile', label: 'Profile', icon: <UserCircle /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 /> },
        { id: 'billing', label: 'Billing', icon: <Wallet /> },
    ];

    const secondaryNavItems = [
        { id: 'support', label: 'Support', icon: <HelpCircle /> },
    ];

    const renderView = () => {
        const isLoading = campaignsLoading || ordersLoading || profileLoading || isUserLoading;

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
        <div className="flex h-screen bg-slate-200 from-white/30 bg-gradient-to-br font-sans text-slate-800">
             <aside className={`bg-white/40 backdrop-blur-xl text-slate-800 flex flex-col no-scrollbar transition-all duration-300 ease-in-out border-r border-slate-300/70 shadow-sm ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                <div className="h-16 flex items-center px-4 justify-center border-b border-slate-300/70 flex-shrink-0">
                    <div className={`transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'w-0' : 'w-auto'}`}>
                        <Logo />
                    </div>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <div key={item.id}>
                            <NavItem
                                icon={item.icon}
                                label={sidebarCollapsed ? '' : item.label}
                                active={activeView === item.id}
                                onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                            />
                        </div>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-300/70 flex-shrink-0">
                    {secondaryNavItems.map(item => (
                        <div key={item.id}>
                            <NavItem
                                icon={item.icon}
                                label={sidebarCollapsed ? '' : item.label}
                                active={activeView === item.id}
                                onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-white/30 hover:text-slate-900 mt-2 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <span className="mr-3"><LogOut /></span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-slate-300/70 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleSidebar}
                            className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-white/30"
                            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarCollapsed ? <Menu /> : <X />}
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 capitalize">{activeView.replace(/_/g, ' ')}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-slate-600 hover:text-slate-900"><Bell/></button>
                        <button className="text-slate-600 hover:text-slate-900"><UserCircle/></button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">{renderView()}</main>
            </div>
            
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
                                onCreateCampaign={handleCreateCampaign}
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

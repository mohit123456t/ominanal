'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useAuth } from '@/firebase';
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

const BrandPanel = ({ viewBrandId: propViewBrandId, onBack }: { viewBrandId?: string; onBack?: () => void }) => {
    const router = useRouter();
    const isViewMode = !!propViewBrandId;
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fbAuth = useAuth();

    const [signupData, setSignupData] = useState({
        name: '', brandName: '', brandId: '', phone: '', company: '', website: '', industry: '', budget: '', goals: ''
    });

    useEffect(() => {
        if(!fbAuth) return;
        const unsubscribe = onAuthStateChanged(fbAuth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [fbAuth]);

    const handleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                if(fbAuth) await signInWithEmailAndPassword(fbAuth, email, password);
            } else {
                if(fbAuth) {
                    await createUserWithEmailAndPassword(fbAuth, email, password);
                    alert("Signup successful! (DB connection is disabled)");
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (isViewMode) {
            window.close(); // or router.push('/admin_panel')
        } else {
            try {
                if(fbAuth) await signOut(fbAuth);
                router.push('/');
            } catch (error) {
                console.error('Logout error:', error);
                router.push('/');
            }
        }
    };


    const [activeView, setActiveView] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('brandActiveView')) || 'dashboard');
    const [selectedCampaign, setSelectedCampaign] = useState(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('brandSelectedCampaign');
        return saved ? JSON.parse(saved) : null;
    });

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('brandActiveView', activeView);
        }
    }, [activeView]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('brandSelectedCampaign', JSON.stringify(selectedCampaign));
        }
    }, [selectedCampaign]);
    
    useEffect(() => {
        // Placeholder data since DB is disconnected
        setProfile({ name: 'Brand User', brandName: 'Awesome Brand', email: user?.email });
        setCampaigns([
            { id: 'camp1', name: 'Summer Sale', status: 'Active', budget: 50000, reels: [] },
            { id: 'camp2', name: 'Winter Collection', status: 'Completed', budget: 75000, reels: [] }
        ]);
        setOrders([ {id: 'order1', campaignName: 'Summer Sale', reels: 10, amount: 10000} ]);
    }, [user?.uid, propViewBrandId]);

    const handleSelectCampaign = (campaign: any) => {
        setSelectedCampaign(campaign);
        setActiveView('campaign_detail');
    };
    
    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setActiveView('campaigns');
    };

    const handleCreateCampaign = async (newCampaign: any) => {
        alert("Campaign created! (This is a demo, not saved to DB)");
        setCampaigns(prev => [...prev, {id: `demo-${Date.now()}`, ...newCampaign}]);
        setShowNewCampaignForm(false);
    };

    const handleUpdateCampaign = async (updatedCampaign: any) => {
        alert("Campaign updated! (This is a demo, not saved to DB)");
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    };

    const handleCreateOrder = async (newOrder: any) => {
       alert("Order created! (This is a demo, not saved to DB)");
        setOrders(prev => [...prev, {id: `demo-${Date.now()}`, ...newOrder}]);
        setShowOrderForm(false);
    };

    const handleUpdateProfile = async (updatedProfile: any) => {
        alert("Profile updated! (This is a demo, not saved to DB)");
        setProfile(prev => ({...prev, ...updatedProfile}));
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
        if (selectedCampaign && activeView === 'campaign_detail') {
            return <CampaignDetailView campaignId={selectedCampaign.id} onClose={handleBackToCampaigns} onCreateOrder={() => setShowOrderForm(true)} />;
        }
        switch (activeView) {
            case 'campaigns':
                return <CampaignsView campaigns={campaigns} onSelectCampaign={handleSelectCampaign} onNewCampaign={() => setShowNewCampaignForm(true)} onCreateOrder={handleCreateOrderForCampaign} />;
            case 'pricing': return <PricingView />;
            case 'analytics': return <AnalyticsView campaigns={campaigns} />;
            case 'billing': return <BillingView user={user} />;
            case 'support': return <SupportView user={user} campaigns={campaigns} />;
            case 'profile': return <ProfileView user={user} profile={profile} onUpdateProfile={handleUpdateProfile} />;
            case 'dashboard':
            default:
                return <DashboardView campaigns={campaigns} profile={profile} onNewCampaign={() => setShowNewCampaignForm(true)} onNavigateToAnalytics={() => setActiveView('analytics')} onNavigateToCampaigns={() => setActiveView('campaigns')} />;
        }
    };

    if (!user && !isViewMode) {
        // LOGIN / SIGNUP UI (Not part of the main panel)
         return (
            <div className="flex h-screen items-center justify-center bg-slate-100">
                <div className="w-full max-w-md">
                     <div className="text-center mb-8"><Logo /></div>
                    <div className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/50">
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">{isLogin ? 'Brand Login' : 'Brand Signup'}</h2>
                         {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
                        
                        {!isLogin && (
                             <div className="space-y-4 mb-4">
                                <input type="text" placeholder="Your Name" value={signupData.name} onChange={e => setSignupData({...signupData, name: e.target.value})} className="w-full p-3 rounded-lg border focus:ring-blue-500 focus:border-blue-500" />
                                <input type="text" placeholder="Brand Name" value={signupData.brandName} onChange={e => setSignupData({...signupData, brandName: e.target.value})} className="w-full p-3 rounded-lg border focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        )}
                        
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 mb-4 rounded-lg border focus:ring-blue-500 focus:border-blue-500" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 mb-4 rounded-lg border focus:ring-blue-500 focus:border-blue-500" />
                        
                        <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                        
                        <p className="text-center text-sm mt-4">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold ml-1">
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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

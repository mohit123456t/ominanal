'use client';
import React, { useState } from 'react';
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
import { useAuth } from '@/firebase';


// --- Placeholder Views ---
const PlaceholderView = ({ name, onNavigate, onViewBrand }: { name: string; onNavigate?: (view: string) => void; onViewBrand?: (brandId: string) => void; }) => (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
        <p className="text-slate-500 mt-2">This is a placeholder for the {name} view.</p>
        {onNavigate && <button onClick={() => onNavigate('earnings')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded">Go to Earnings (Demo)</button>}
        {onViewBrand && <button onClick={() => onViewBrand('brand-123')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded">View Brand (Demo)</button>}
    </div>
);

const DashboardView = ({ onViewChange }: { onViewChange: (view: string) => void }) => <PlaceholderView name="Dashboard" onNavigate={onViewChange} />;
const ProfileView = () => <PlaceholderView name="Profile" />;
const CampaignManagerView = () => <PlaceholderView name="Campaign Manager" />;
const CampaignApprovalView = () => <PlaceholderView name="Campaign Approval" />;
const UserManagementView = ({ onViewBrand }: { onViewBrand: (brandId: string) => void }) => <PlaceholderView name="User Management" onViewBrand={onViewBrand} />;
const FinanceView = ({ setView }: { setView: (view: string) => void }) => <PlaceholderView name="Finance" onNavigate={setView} />;
const EarningsView = ({ setView }: { setView: (view: string) => void }) => <PlaceholderView name="Earnings" onNavigate={setView} />;
const CommunicationView = () => <PlaceholderView name="Communication" />;
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
    const [selectedBrandId, setSelectedBrandId] = useState(null);
    const router = useRouter();
    const auth = useAuth();

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

    const renderView = () => {
        switch (activeView) {
            case 'profile': return <ProfileView />;
            case 'campaigns': return <CampaignManagerView />;
            case 'campaign-approval': return <CampaignApprovalView />;
            case 'users': return <UserManagementView onViewBrand={(brandId: any) => { setSelectedBrandId(brandId); setActiveView('brand_view'); }} />;
            case 'finance': return <FinanceView setView={setActiveView} />;
            case 'earnings': return <EarningsView setView={setActiveView} />; 
            case 'communication': return <CommunicationView />;
            case 'brand_view': return <BrandPanel viewBrandId={selectedBrandId} onBack={() => setActiveView('users')} />;
            case 'dashboard':
            default:
                return <DashboardView onViewChange={setActiveView} />;
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
                            onClick={() => setActiveView(item.id)}
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
                        onClick={() => router.push('/dashboard')}
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
                        <div className="font-semibold text-sm text-slate-700">Admin</div>
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

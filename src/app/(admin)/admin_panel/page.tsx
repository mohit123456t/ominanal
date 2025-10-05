'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Briefcase,
  IndianRupee,
  Shield,
  Pencil,
  Tag,
  Users as UsersGroup,
  ArrowLeft,
  Plus,
  ChartBar,
  Clipboard,
} from 'lucide-react';
import { useAuth } from '@/firebase';

// Placeholder for the actual dashboard view
const AdminDashboard = () => (
    <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to the Admin Panel.</p>
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
        transition={{ delay: 0.3 + index * 0.07 }}
    >
        <span className={`mr-3 ${active ? 'text-indigo-600' : 'text-slate-600'}`}>{icon}</span>
        {label}
    </motion.button>
);

function AdminPanel() {
    const [activeView, setActiveView] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const auth = useAuth();

    const handleLogout = async () => {
        try {
            if (auth) {
                await auth.signOut();
            }
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        }
    };

    const renderView = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>;
        }
        switch (activeView) {
            case 'dashboard': return <AdminDashboard />;
            // Add other admin views here
            default: return <AdminDashboard />;
        }
    };

    const adminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        // Add other admin navigation items here
    ];

    return (
        <div className="flex h-screen font-sans bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent">
            <motion.aside 
                className="fixed left-0 top-0 h-full w-64 bg-white/40 backdrop-blur-xl flex flex-col z-50 shadow-2xl border-r border-slate-300/70"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-300/70 flex-shrink-0">
                    <h2 className="font-bold text-lg text-slate-800">Admin Panel</h2>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {adminNavItems.map((item, index) => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id}
                            onClick={() => setActiveView(item.id)}
                            index={index}
                        />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-300/70 flex-shrink-0">
                    <motion.button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-all"
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-3"><LogOut size={18}/></span>
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

            <main className="flex-1 ml-64 overflow-y-auto">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        className="p-8"
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

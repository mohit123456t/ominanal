'use client';
import React, { useState, useEffect } from 'react';
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
  PlayCircle,
  Users,
  Rocket,
} from 'lucide-react';
import { useAuth } from '@/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


// --- Placeholder Views ---
const PlaceholderView = ({ name, onNavigate, onViewBrand }: { name: string; onNavigate?: (view: string) => void; onViewBrand?: (brandId: string) => void; }) => (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
        <p className="text-slate-500 mt-2">This is a placeholder for the {name} view.</p>
        {onNavigate && <button onClick={() => onNavigate('earnings')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded">Go to Earnings (Demo)</button>}
        {onViewBrand && <button onClick={() => onViewBrand('brand-123')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded">View Brand (Demo)</button>}
    </div>
);

// 🧩 StatCard Component — iOS स्टाइल फ्रॉस्टेड ग्लास
const StatCard = ({ title, value, change, icon, color, size = 'normal' }: {title: string, value: string, change: string, icon: React.ReactNode, color: {bg: string, text: string}, size?: string}) => (
  <motion.div
    className={`bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 ${
      size === 'large' ? 'md:col-span-2' : ''
    }`}
    variants={itemVariants}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-md font-semibold text-slate-700">{title}</h3>
      <div className={`p-3 rounded-lg ${color.bg} ${color.text}`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{value}</p> 
    <p className="text-sm text-slate-500 flex items-center">{change}</p>
  </motion.div>
);

// एनिमेशन वेरिएंट्स
const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, y: 0, scale: 1, 
      transition: { type: 'spring', stiffness: 100, damping: 14 } 
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
};

// 🖥️ Main Dashboard — iOS फ्रॉस्टेड ग्लास थीम
const DashboardView = ({ onViewChange }: { onViewChange: (view: string) => void }) => {
  const [showFinance, setShowFinance] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 567890, netProfit: 397523, activeCampaigns: 42, totalTeamMembers: 15,
    totalViews: 1250000, pendingApprovals: 8, accountIssues: 0,
  });
  const [revenueData, setRevenueData] = useState([
      { name: 'Jan', revenue: 240000, expenses: 150000 },
      { name: 'Feb', revenue: 310000, expenses: 180000 },
      { name: 'Mar', revenue: 450000, expenses: 250000 },
      { name: 'Apr', revenue: 420000, expenses: 280000 },
      { name: 'May', revenue: 580000, expenses: 350000 },
      { name: 'Jun', revenue: 567890, expenses: 397523 },
  ]);
  const [brands, setBrands] = useState([
      { id: '1', name: 'Brand A', status: 'Active' },
      { id: '2', name: 'Brand B', status: 'Active' },
      { id: '3', name: 'Brand C', status: 'Pending' },
  ]);
  const [loading, setLoading] = useState(false);


  return (
    <div className="min-h-screen">
      <motion.div
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Dashboard</h1>
          <p className="text-md text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <motion.button
          onClick={() => onViewChange('finance')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/20 font-semibold"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {showFinance ? 'Back to Dashboard' : 'View Finance Details'}
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {showFinance ? (
          <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FinanceView setView={onViewChange} />
          </motion.div>
        ) : (
          <motion.div key="dashboard">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <StatCard
                    title="Active Campaigns" value={dashboardData.activeCampaigns.toString()}
                    change={`${dashboardData.pendingApprovals} pending`} icon={<PlayCircle />}
                    color={{bg: "bg-purple-100", text: "text-purple-600"}}
                  />
                  <StatCard
                    title="Team Members" value={dashboardData.totalTeamMembers.toString()}
                    change="All active" icon={<Users />}
                    color={{bg: "bg-orange-100", text: "text-orange-600"}}
                  />
                  <StatCard
                    title="Total Views" value={dashboardData.totalViews.toLocaleString()}
                    change="Across all campaigns" icon={<Rocket />}
                    color={{bg: "bg-pink-100", text: "text-pink-600"}} size="large"
                  />
                  <StatCard
                    title="Pending Approvals" value={dashboardData.pendingApprovals.toString()}
                    change="Action required" icon={<CheckCircle />}
                    color={{bg: "bg-yellow-100", text: "text-yellow-600"}} size="large"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <motion.div className="xl:col-span-2 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80" variants={itemVariants}>
                    <h3 className="font-bold text-xl mb-6 text-slate-800">Revenue Analytics</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0, 0, 0, 0.1)', 
                                borderRadius: '12px',
                             }}
                          />
                          <Legend wrapperStyle={{ fontSize: '14px' }}/>
                          <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80" variants={itemVariants}>
                    <h3 className="font-bold text-xl mb-6 text-slate-800">Recent Brands</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                       {brands.length > 0 ? brands.slice(0, 5).map((brand: any, index) => (
                        <motion.div
                          key={brand.id}
                          className="p-4 bg-white/30 rounded-lg border border-slate-300/50 hover:bg-white/70 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-semibold text-slate-800">{brand.name || 'Unknown Brand'}</h4>
                          <p className="text-sm text-slate-500">Status: {brand.status || 'N/A'}</p>
                        </motion.div>
                      )) : <p className="text-slate-500">No brands available.</p>}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


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

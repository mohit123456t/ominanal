'use client';
import React, { useState, useEffect } from 'react';
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
  PlayCircle,
  Rocket,
  Clock,
  CheckCircle,
  IndianRupee,
  Users as UsersGroup,
  Pencil,
  Tag,
  ChartBar,
} from 'lucide-react';
import { useAuth } from '@/firebase';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// --- Placeholder Components for missing views ---
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="text-center text-slate-500 p-8">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>This component has not been implemented yet.</p>
  </div>
);
const StaffManagementView = () => <PlaceholderView title="Staff Management" />;
const ReelsUploadedPage = () => <PlaceholderView title="Reels Uploaded" />;
const UploaderManagerView = () => <PlaceholderView title="Uploader Manager" />;
const ScriptWriterManagerView = () => <PlaceholderView title="Script Writer Manager" />;
const ThumbnailMakerManagerView = () => <PlaceholderView title="Thumbnail Maker Manager" />;
const VideoEditorManagerView = () => <PlaceholderView title="Video Editor Manager" />;
const PricingManagement = () => <PlaceholderView title="Pricing Management" />;
// --- End Placeholder Components ---

const formatNumber = (value: number) => {
    if (!value) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
};

const StatCard = ({ title, value, icon, color, size = 'normal' }: { title: string, value: string, icon: React.ReactNode, color: string, size?: 'normal' | 'large' }) => (
  <motion.div
    className={`bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 
    ${size === 'large' ? 'p-6 text-base md:col-span-2' : 'p-4 text-sm'}`}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <div className={`text-xl p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className={`font-bold ${size === 'large' ? 'text-3xl' : 'text-2xl'} text-slate-900 tracking-tight`}>
      {value}
    </p>
  </motion.div>
);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="font-bold text-slate-800">{`Earnings: ₹${formatNumber(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
};
  
const SuperAdminDashboard = ({ data }: { data: any }) => {
    const userCounts = { brands: 1254 };
    const dashboardData = {
      totalActiveCampaigns: 48,
      liveCampaigns: 12,
      pendingCampaigns: 5,
      brandsWithLiveCampaigns: 8,
      brandsWithoutCampaigns: 1246,
      totalCampaignEarnings: 567890,
      campaignEarnings: [
          { name: 'Jan', earnings: 40000 },
          { name: 'Feb', earnings: 30000 },
          { name: 'Mar', earnings: 50000 },
          { name: 'Apr', earnings: 45000 },
          { name: 'May', earnings: 60000 },
          { name: 'Jun', earnings: 75000 },
      ]
    };
  
    const safeFormat = (value: number) => formatNumber(value || 0);
  
    return (
      <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
      >
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Super Admin Dashboard</h1>
          <p className="text-md text-slate-500 mt-1">Comprehensive overview of all platform activities.</p>
        </div>
  
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Brands" value={safeFormat(userCounts.brands)}
            icon={<Briefcase />} color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Active Campaigns" value={safeFormat(dashboardData.totalActiveCampaigns)}
            icon={<PlayCircle />} color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Live Campaigns" value={safeFormat(dashboardData.liveCampaigns)}
            icon={<Rocket />} color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Pending Campaigns" value={safeFormat(dashboardData.pendingCampaigns)}
            icon={<Clock />} color="bg-orange-100 text-orange-600"
          />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Brands with Live Campaigns" value={safeFormat(dashboardData.brandsWithLiveCampaigns)}
            icon={<CheckCircle />} color="bg-teal-100 text-teal-600" size="large"
          />
          <StatCard
            title="Brands without Campaigns" value={safeFormat(dashboardData.brandsWithoutCampaigns)}
            icon={<Users />} color="bg-yellow-100 text-yellow-600" size="large"
          />
          <StatCard
            title="Total Campaign Earnings" value={`₹${safeFormat(dashboardData.totalCampaignEarnings)}`}
            icon={<IndianRupee />} color="bg-pink-100 text-pink-600" size="large"
          />
        </div>
  
        <motion.div 
          className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-xl mb-6 text-slate-800">Campaign Earnings Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.campaignEarnings || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickFormatter={(value) => formatNumber(value)}
                  tickLine={false} axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="earnings" fill="#4f46e5" name="Earnings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    );
};

const FinanceStatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
    <motion.div 
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
            <div className={`text-2xl p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">₹{value}</p>
    </motion.div>
);

const SuperAdminFinance = ({ data, onNavigate }: { data: any, onNavigate: (view: string) => void }) => {
    const financeData = data || {};
    const safeFormat = (value: number) => formatNumber(value || 0);
    const monthlyData = [
        { month: 'Jan', revenue: 240000, expenses: 150000 },
        { month: 'Feb', revenue: 310000, expenses: 180000 },
        { month: 'Mar', revenue: 450000, expenses: 250000 },
        { month: 'Apr', revenue: 420000, expenses: 280000 },
        { month: 'May', revenue: 580000, expenses: 350000 },
        { month: 'Jun', revenue: financeData.totalRevenue || 0, expenses: financeData.totalExpenses || 0 }, // Current month
    ];

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Financial Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time tracking of revenue, and expenses.</p>
                </div>
                <motion.button
                    onClick={() => onNavigate('pricing_management')}
                    className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="mr-2"><Tag size={18} /></span>
                    Manage Pricing
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FinanceStatCard 
                    title="Total Revenue"
                    value={safeFormat(financeData.totalRevenue)} 
                    icon={<IndianRupee />}
                    color="bg-green-100 text-green-600"
                />
                <FinanceStatCard 
                    title="Total Expenses"
                    value={safeFormat(financeData.totalExpenses)} 
                    icon={<ChartBar />}
                    color="bg-red-100 text-red-600"
                />
            </div>

            <motion.div 
                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-xl font-bold mb-6 text-slate-800">Monthly Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${formatNumber(value)}`} tickLine={false} axisLine={false}/>
                        <Tooltip 
                            formatter={(value: any) => `₹${formatNumber(value)}`}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0, 0, 0, 0.1)', 
                                borderRadius: '12px',
                             }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} name="Expenses" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    );
};


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

export default function SuperAdminPanel() {
    const [activeView, setActiveView] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState({});
    const [financeData, setFinanceData] = useState({ totalRevenue: 680000, totalExpenses: 420000 });
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
            case 'dashboard': return <SuperAdminDashboard data={dashboardData} />;
            case 'staff_management': return <StaffManagementView />;
            case 'uploader_manager': return <UploaderManagerView />;
            case 'script_writer_manager': return <ScriptWriterManagerView />;
            case 'thumbnail_maker_manager': return <ThumbnailMakerManagerView />;
            case 'video_editor_manager': return <VideoEditorManagerView />;
            case 'reels_uploaded': return <ReelsUploadedPage />;
            case 'finance': return <SuperAdminFinance data={financeData} onNavigate={setActiveView} />;
            case 'pricing_management': return <PricingManagement />;
            default: return <SuperAdminDashboard data={dashboardData} />;
        }
    };

    const superAdminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'finance', label: 'Finance', icon: <IndianRupee size={18} /> },
        { id: 'staff_management', label: 'Staff Management', icon: <UsersGroup size={18} /> },
        { id: 'uploader_manager', label: 'Uploader Manager', icon: <Upload size={18} /> },
        { id: 'script_writer_manager', label: 'Script Writer Manager', icon: <Pencil size={18} /> },
        { id: 'thumbnail_maker_manager', label: 'Thumbnail Maker Manager', icon: <ImageIcon size={18} /> },
        { id: 'video_editor_manager', label: 'Video Editor Manager', icon: <Video size={18} /> },
        { id: 'reels_uploaded', label: 'Reels Uploaded', icon: <FileText size={18} /> },
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
                    <h2 className="font-bold text-lg text-slate-800">Super Admin</h2>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {superAdminNavItems.map((item, index) => (
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
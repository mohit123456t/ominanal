'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
  Trash,
  Plus,
  ArrowLeft,
  Clipboard,
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
const ReelsUploadedPage = () => <PlaceholderView title="Reels Uploaded" />;
const UploaderManagerView = () => <PlaceholderView title="Uploader Manager" />;
const ScriptWriterManagerView = () => <PlaceholderView title="Script Writer Manager" />;
const ThumbnailMakerManagerView = () => <PlaceholderView title="Thumbnail Maker Manager" />;
const VideoEditorManagerView = () => <PlaceholderView title="Video Editor Manager" />;

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

const ManagementCard = ({ title, children }: {title: string, children: React.ReactNode}) => (
    <motion.div
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </motion.div>
);

const InputField = ({ label, type = 'number', value, onChange, placeholder }: {label: string, type?: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string}) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
    </div>
);

const PricingManagement = () => {
    const [pricePerReel, setPricePerReel] = useState(150);
    const [avgViewsPerReel, setAvgViewsPerReel] = useState(5000);
    const [discountTiers, setDiscountTiers] = useState([
      { reels: 10, discount: 5 },
      { reels: 20, discount: 10 },
    ]);
    const [coupons, setCoupons] = useState([
        { id: 'LAUNCH20', discount: 20, limit: 100, used: 25, isActive: true },
        { id: 'NEWYEAR', discount: 15, limit: 'unlimited' as 'unlimited' | number, used: 150, isActive: true },
    ]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', limit: '' });
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    const handleAddTier = () => {
        setDiscountTiers([...discountTiers, { reels: 0, discount: 0 }]);
    };

    const handleUpdateTier = (index: number, field: 'reels' | 'discount', value: string) => {
        const updatedTiers = [...discountTiers];
        updatedTiers[index][field] = Number(value);
        setDiscountTiers(updatedTiers);
    };
    
    const handleRemoveTier = (index: number) => {
        setDiscountTiers(discountTiers.filter((_, i) => i !== index));
    };
    
    const handleAddCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;
        const newCouponData = {
            id: newCoupon.code.toUpperCase(),
            discount: Number(newCoupon.discount),
            limit: newCoupon.limit ? Number(newCoupon.limit) : 'unlimited' as 'unlimited' | number,
            used: 0,
            isActive: true,
        };
        setCoupons(prev => [...prev, newCouponData]);
        setNewCoupon({ code: '', discount: '', limit: '' });
    };

    const handleDeleteCoupon = (couponId: string) => {
        setCoupons(coupons.filter(c => c.id !== couponId));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        console.log("Saving pricing changes:", { pricePerReel, avgViewsPerReel, discountTiers });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><p>Loading pricing settings...</p></div>;
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Pricing &amp; Coupon Management</h1>
                <p className="text-slate-500 mt-1">Set campaign pricing, volume discounts, and promotional coupons.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ManagementCard title="Base Pricing">
                         <InputField 
                            label="Price per Reel (₹)" 
                            value={pricePerReel} 
                            onChange={(e) => setPricePerReel(Number(e.target.value))}
                        />
                         <InputField 
                            label="Average Views per Reel (for estimation)" 
                            value={avgViewsPerReel} 
                            onChange={(e) => setAvgViewsPerReel(Number(e.target.value))}
                        />
                    </ManagementCard>

                    <ManagementCard title="Volume Discounts">
                        {discountTiers.map((tier, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 rounded-md hover:bg-black/5">
                                <span className="font-medium text-slate-700">If reels ≥</span>
                                <input type="number" value={tier.reels} onChange={e => handleUpdateTier(index, 'reels', e.target.value)} className="w-24 px-2 py-1 bg-white/50 border rounded-md"/>
                                <span className="font-medium text-slate-700">, give</span>
                                <input type="number" value={tier.discount} onChange={e => handleUpdateTier(index, 'discount', e.target.value)} className="w-20 px-2 py-1 bg-white/50 border rounded-md"/>
                                <span className="font-medium text-slate-700">% discount.</span>
                                <button onClick={() => handleRemoveTier(index)} className="text-red-500 hover:text-red-700 ml-auto"><Trash/></button>
                            </div>
                        ))}
                        <button onClick={handleAddTier} className="mt-2 text-indigo-600 font-semibold text-sm flex items-center">
                           <span className="mr-1"><Plus/></span> Add Discount Tier
                        </button>
                    </ManagementCard>
                    
                    <div className="flex justify-end">
                        <motion.button 
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 disabled:bg-indigo-400"
                            whileHover={{ scale: isSaving ? 1 : 1.05 }}
                        >
                            {isSaving ? 'Saving...' : 'Save All Pricing Changes'}
                        </motion.button>
                    </div>
                </div>
                
                <div className="space-y-8">
                     <ManagementCard title="Create New Coupon">
                        <form onSubmit={handleAddCoupon} className="space-y-4">
                            <InputField 
                                label="Coupon Code"
                                type="text"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                placeholder="e.g., LAUNCH20"
                            />
                            <InputField 
                                label="Discount Percentage (%)"
                                value={newCoupon.discount}
                                onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})}
                                placeholder="e.g., 20"
                            />
                            <InputField 
                                label="Usage Limit (optional)"
                                value={newCoupon.limit}
                                onChange={e => setNewCoupon({...newCoupon, limit: e.target.value})}
                                placeholder="e.g., 100"
                            />
                            <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900 transition-colors shadow-md">
                                Create Coupon
                            </button>
                        </form>
                    </ManagementCard>

                    <ManagementCard title="Active Coupons">
                        {coupons.map(coupon => (
                            <div key={coupon.id} className="flex justify-between items-center bg-black/5 p-3 rounded-lg">
                                <div>
                                    <p className="font-mono text-slate-900 font-bold">{coupon.id}</p>
                                    <p className="text-sm text-slate-600">{coupon.discount}% off | Used: {coupon.used}/{coupon.limit}</p>
                                </div>
                                <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700"><Trash/></button>
                            </div>
                        ))}
                         {coupons.length === 0 && <p className="text-slate-500 text-center py-4">No active coupons found.</p>}
                    </ManagementCard>
                </div>
            </div>
        </div>
    );
};


const PlaceholderView = ({ title }: { title: string }) => (
  <div className="text-center text-slate-500 p-8">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>This component has not been implemented yet.</p>
  </div>
);

const StaffCard = ({ name, count, icon, onClick, gradient }: { name: string, count: number, icon: React.ReactNode, onClick: () => void, gradient: string }) => (
    <motion.div
        onClick={onClick}
        className="cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6 flex-1"
        whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}
    >
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <p className="text-xl font-bold text-slate-900">{name}</p>
                <p className="text-sm text-slate-600">{count} members</p>
            </div>
            {React.isValidElement(icon) && (
                <div className={`p-3 rounded-lg ${gradient}`}>
                    {React.cloneElement(icon, { className: 'h-8 w-8' })}
                </div>
            )}
        </div>
    </motion.div>
);

const StaffManagementView = () => {
    const [allStaff, setAllStaff] = useState<any>({
        'Brands': [{id: 1, name: 'Brand A', email: 'brandA@example.com', isActive: true}],
        'Admins': [{id: 2, name: 'Admin User', email: 'admin@example.com', isActive: true}],
        'Editors': [],
        'Script Writers': [{id: 3, name: 'Writer Guy', email: 'writer@example.com', isActive: false}],
        'Thumbnail Makers': [],
        'Uploaders': [],
    });
    const [loading, setLoading] = useState(false); // No loading as we use placeholder data
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: '' });

    const staffCategoriesList = [
        { name: 'Brands', icon: <UsersGroup />, role: 'brand', gradient: 'bg-indigo-100 text-indigo-600' },
        { name: 'Admins', icon: <Briefcase />, role: 'admin', gradient: 'bg-blue-100 text-blue-600' },
        { name: 'Editors', icon: <Pencil />, role: 'video_editor', gradient: 'bg-purple-100 text-purple-600' },
        { name: 'Script Writers', icon: <Clipboard />, role: 'script_writer', gradient: 'bg-green-100 text-green-600' },
        { name: 'Thumbnail Makers', icon: <ImageIcon />, role: 'thumbnail_maker', gradient: 'bg-orange-100 text-orange-600' },
        { name: 'Uploaders', icon: <Upload />, role: 'uploader', gradient: 'bg-pink-100 text-pink-600' },
    ];

    const fetchStaff = useCallback(async () => {
        // This function is kept for structure but does nothing as we are using placeholders.
    }, []);

    useEffect(() => {
        // No need to fetch, data is already set.
    }, [fetchStaff]);
    
    const handleAddStaff = async () => {
        alert("This is a demo. 'Add Staff' functionality is not connected.");
        setIsAddModalOpen(false);
    };
    const handleDeactivateReactivateStaff = async (staff: any, makeActive: boolean) => {
        alert(`This is a demo. Would have set ${staff.name} to ${makeActive ? 'Active' : 'Inactive'}.`);
    };
    const handleResetPassword = async (email: string) => {
        alert(`This is a demo. Would have sent a password reset to ${email}.`);
    };

    const staffCategories = staffCategoriesList.map(category => ({
        name: category.name,
        count: allStaff[category.name]?.length || 0,
        icon: category.icon,
        gradient: category.gradient
    }));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (selectedCategory) {
        const staffList = allStaff[selectedCategory] || [];
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                    onClick={() => setSelectedCategory(null)}
                    className="mb-8 flex items-center bg-white/50 backdrop-blur-xl text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-white/80 shadow-lg shadow-slate-200/80 border border-slate-300/50 transition"
                >
                    <span className="mr-2"><ArrowLeft/></span> Back to Categories
                </button>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter mb-6">{selectedCategory}</h1>
                <motion.div
                    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-300/50">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-300/50">
                                {staffList.map((staff: any) => (
                                    <tr key={staff.id} className="hover:bg-white/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{staff.name}</td>
                                        <td className="p-4 text-slate-600">{staff.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                staff.isActive ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
                                            }`}>
                                                {staff.isActive ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleResetPassword(staff.email)} className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition">Reset Password</button>
                                            <button onClick={() => handleDeactivateReactivateStaff(staff, !staff.isActive)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                                                staff.isActive ? 'text-red-700 bg-red-500/10 hover:bg-red-500/20' : 'text-green-700 bg-green-500/10 hover:bg-green-500/20'
                                            }`}>
                                                {staff.isActive ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {staffList.length === 0 && <p className="text-center p-12 text-slate-500">No staff members in this category yet.</p>}
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Staff Management</h1>
                    <p className="text-slate-500 mt-1">Manage all staff members and their roles.</p>
                </div>
                <motion.button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    <span className="mr-2"><Plus/></span> Add New Staff
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffCategories.map((cat, index) => (
                    <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <StaffCard {...cat} onClick={() => setSelectedCategory(cat.name)} />
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div 
                        className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-300/50"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <h2 className="text-2xl font-bold mb-6 text-slate-900">Add New Staff Member</h2>
                            <form onSubmit={e => { e.preventDefault(); handleAddStaff(); }} className="space-y-5">
                                <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                <input type="email" placeholder="Email Address" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                <input type="password" placeholder="New Password (min. 6 chars)" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full p-4 bg-white/50 border border-slate-300/70 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none" required>
                                    <option value="" disabled>Select a role for the staff member</option>
                                    {staffCategoriesList.map(cat => <option key={cat.role} value={cat.role}>{cat.name}</option>)}
                                </select>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-slate-500/10 text-slate-800 rounded-lg font-medium hover:bg-slate-500/20 transition">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30">Add Staff</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
    const [isLoading, setIsLoading] = useState(false); // Not fetching data, so no loading state
    const [dashboardData, setDashboardData] = useState({}); // Placeholder
    const [financeData, setFinanceData] = useState({ totalRevenue: 680000, totalExpenses: 420000 }); // Placeholder
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
            // Even if signout fails, redirect to login
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
            </aside>

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
</>
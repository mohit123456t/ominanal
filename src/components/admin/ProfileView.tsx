'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const formatAdminUID = (uid?: string) => {
    if (!uid) return 'ADM000';
    const last3 = uid.slice(-3);
    const num = parseInt(last3, 16) % 1000;
    return `ADM${num.toString().padStart(3, '0')}`;
};

const ProfileView = () => {
    const [profile, setProfile] = useState<Partial<any>>({
        uid: 'abc-123-xyz',
        name: 'Admin User',
        email: 'admin@example.com',
        mobileNumber: '9876543210',
        role: 'Admin',
        department: 'Administration',
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 },
        photoURL: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        // This is a placeholder for the update logic.
        alert('✅ Profile updated successfully! (This is a demo)');
        setIsEditing(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Profile Settings</h1>
                        <p className="mt-1 text-slate-500">Manage your personal information and account settings.</p>
                    </div>
                    <motion.button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg w-full sm:w-auto ${
                            isEditing 
                            ? 'bg-slate-600/10 backdrop-blur-sm text-slate-800 border border-slate-300/70 hover:bg-slate-600/20' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div 
                        className="lg:col-span-1 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-center mb-6">
                            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-inner overflow-hidden">
                                {profile.photoURL ? (
                                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile.name?.charAt(0).toUpperCase() || 'A'
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mt-4">{profile.name || 'N/A'}</h2>
                            <p className="text-indigo-600 font-semibold">{profile.role}</p>
                            <p className="text-slate-500 text-sm mt-1">ID: {formatAdminUID(profile.uid)}</p>
                        </div>
                        <div className="space-y-4">
                            <InfoField icon="📧" label="Email Address" value={profile.email} />
                            <InfoField icon="📱" label="Phone" value={profile.mobileNumber || '—'} />
                            <InfoField icon="📅" label="Member Since" value={profile.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'} />
                        </div>
                    </motion.div>

                    <motion.div 
                        className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditableField label="Full Name" value={profile.name} isEditing={isEditing} onChange={(e) => handleInputChange('name', e.target.value)} />
                            <EditableField label="Email Address" value={profile.email} isEditing={isEditing} type="email" onChange={(e) => handleInputChange('email', e.target.value)} />
                            <EditableField label="Phone Number" value={profile.mobileNumber} isEditing={isEditing} type="tel" onChange={(e) => handleInputChange('mobileNumber', e.target.value)} placeholder="Enter phone number" />
                            <ReadOnlyField label="Department" value={profile.department || 'Administration'} />
                            <ReadOnlyField label="Role" value={profile.role} />
                            <ReadOnlyField label="Admin ID" value={formatAdminUID(profile.uid)} mono />
                        </div>
                        {isEditing && (
                            <div className="mt-8 pt-6 border-t border-slate-300/70 flex justify-end">
                                <motion.button 
                                    onClick={handleUpdateProfile} 
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/20 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    💾 Save Changes
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const InfoField = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
    <div className="flex items-center p-3 bg-white/30 rounded-lg border border-slate-300/50">
        <span className="text-lg text-slate-600 mr-3">{icon}</span>
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="font-semibold text-slate-800">{value || 'N/A'}</p>
        </div>
    </div>
);

const EditableField = ({ label, value, isEditing, onChange, type = 'text', placeholder }: { label: string, value: string, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
        {isEditing ? (
            <input type={type} value={value || ''} onChange={onChange} className="w-full px-4 py-2.5 bg-white/20 border border-slate-300/70 text-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-150 placeholder:text-slate-500" placeholder={placeholder || `Enter ${label.toLowerCase()}`} />
        ) : (
            <div className="px-4 py-2.5 bg-white/30 rounded-lg text-slate-800 font-medium min-h-[46px] flex items-center border border-slate-300/50">
                {value || <span className="text-slate-400">Not provided</span>}
            </div>
        )}
    </div>
);

const ReadOnlyField = ({ label, value, mono }: { label: string, value: string, mono?: boolean }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
        <div className={`px-4 py-2.5 bg-white/30 rounded-lg text-slate-800 font-medium min-h-[46px] flex items-center border border-slate-300/50 ${mono ? 'font-mono text-sm' : ''}`}>
            {value || 'N/A'}
        </div>
    </div>
);

export default ProfileView;

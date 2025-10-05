'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

const SuperAdminProfileView = () => {
    const auth = useAuth();
    const { firestore } = useFirebase();
    const currentUser = auth?.currentUser;
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => 
        currentUser && firestore ? doc(firestore, 'users', currentUser.uid) : null
    , [currentUser, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setProfile({
                name: userProfile.name || currentUser?.displayName || 'Super Admin',
                email: userProfile.email || currentUser?.email || '',
            });
        } else if (currentUser) {
            setProfile({
                name: currentUser.displayName || 'Super Admin',
                email: currentUser.email || '',
            });
        }
    }, [userProfile, currentUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async () => {
        if (!userDocRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        try {
            await setDoc(userDocRef, { name: profile.name }, { merge: true });
            toast({ title: 'Success!', description: 'Your profile has been updated.' });
            setIsEditing(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isProfileLoading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="w-12 h-12 animate-spin text-indigo-600"/></div>;
    }

    return (
         <motion.div 
            className="max-w-3xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">My Profile</h1>
                    <p className="text-slate-500 mt-1">View and manage your super admin account details.</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <motion.div 
                className="bg-white/40 backdrop-blur-xl p-8 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                        {profile.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
                        <p className="text-indigo-600 font-semibold">Super Administrator</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={profile.name} 
                            onChange={handleInputChange} 
                            readOnly={!isEditing} 
                            className={`w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none transition-shadow ${isEditing ? 'focus:ring-2 focus:ring-indigo-500' : 'cursor-default bg-slate-100/50'}`} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={profile.email} 
                            readOnly 
                            className="w-full px-4 py-3 bg-slate-100/50 border border-slate-300/70 rounded-lg cursor-not-allowed" 
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-8 pt-6 border-t border-slate-300/70 flex justify-end">
                         <motion.button 
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/20 transition-all disabled:bg-green-400"
                            whileHover={{ scale: isSaving ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isSaving ? <LoaderCircle className="animate-spin" /> : 'Save Changes'}
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default SuperAdminProfileView;

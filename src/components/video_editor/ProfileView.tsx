'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

const ProfileView = ({ userProfile: initialProfile }: { userProfile: any }) => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(initialProfile) {
            setFormData({ name: initialProfile.name || '' });
        }
    }, [initialProfile]);
    
    const handleSave = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Not authenticated.' });
            return;
        }
        setIsSaving(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { name: formData.name }, { merge: true });
            setIsEditing(false);
            toast({ title: 'Success', description: 'Profile updated successfully.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { x: -15, opacity: 0 },
        visible: { x: 0, opacity: 1 },
    };

    if (!initialProfile) {
        return (
            <div className="text-center py-8">
                <LoaderCircle className="animate-spin h-8 w-8 mx-auto text-indigo-600" />
                <h3 className="text-lg font-semibold mt-4">Loading Profile...</h3>
            </div>
        )
    }

    return (
        <motion.div
            className="max-w-lg mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium">Edit Profile</button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-medium">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center disabled:bg-blue-400">
                             {isSaving && <LoaderCircle className="animate-spin mr-2"/>}
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Info Card */}
            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <motion.div variants={itemVariants}>
                    <label className="font-semibold text-slate-600 text-sm">Editor Name</label>
                    <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        readOnly={!isEditing}
                        className="w-full mt-1 p-2 border rounded-md bg-slate-50 read-only:bg-slate-100 disabled:cursor-not-allowed text-base font-bold text-slate-800"
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="font-semibold text-slate-600 text-sm">Email</label>
                    <input type="email" value={initialProfile.email || 'N/A'} readOnly className="w-full mt-1 p-2 border rounded-md bg-slate-100 cursor-not-allowed text-sm"/>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="font-semibold text-slate-600 text-sm">Last Login</label>
                    <input type="text" value={initialProfile.lastLoginAt ? new Date(initialProfile.lastLoginAt).toLocaleString() : 'N/A'} readOnly className="w-full mt-1 p-2 border rounded-md bg-slate-100 cursor-not-allowed text-sm"/>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="font-semibold text-slate-600 text-sm">Editor ID</label>
                    <input type="text" value={`EDR-${initialProfile.uid ? initialProfile.uid.slice(-4).padStart(4, '0').toUpperCase() : '0000'}`} readOnly className="w-full mt-1 p-2 border rounded-md bg-slate-100 cursor-not-allowed text-sm font-mono"/>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProfileView;

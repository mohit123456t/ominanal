'use client';
import React, { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, User, AtSign, Key } from 'lucide-react';

const ProfileView = ({ userProfile: initialProfile, onProfileUpdate }: { userProfile: any, onProfileUpdate: (profile: any) => void }) => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', scriptId: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialProfile) {
            const scriptIdSuffix = (initialProfile.uid || '').slice(-4).padStart(4, '0');
            const scriptId = `SCP${scriptIdSuffix}`;
            setFormData({
                name: initialProfile.name || '',
                email: initialProfile.email || '',
                scriptId: scriptId,
            });
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
    
    const inputStyle = `w-full mt-1 p-3 border rounded-xl bg-white/50 border-slate-300/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`;
    const readOnlyStyle = `cursor-not-allowed bg-slate-200/50`;

    return (
        <div className="max-w-3xl mx-auto p-1 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Profile</h1>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium shadow-lg hover:bg-slate-900 transition-colors">Edit Profile</button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-slate-200/80 text-slate-800 rounded-xl text-sm font-medium hover:bg-slate-300/80 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center disabled:bg-indigo-400 shadow-lg shadow-indigo-500/20">
                             {isSaving && <LoaderCircle className="animate-spin mr-2"/>}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-slate-300/70 space-y-6">
                 <div>
                    <label className="text-sm font-semibold text-slate-600 flex items-center"><User size={14} className="mr-2"/>Full Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        readOnly={!isEditing}
                        className={`${inputStyle} ${!isEditing ? readOnlyStyle : ''}`}
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 flex items-center"><AtSign size={14} className="mr-2"/>Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className={`${inputStyle} ${readOnlyStyle}`}
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 flex items-center"><Key size={14} className="mr-2"/>Script Writer ID</label>
                    <input
                        type="text"
                        value={formData.scriptId}
                        readOnly
                        className={`${inputStyle} ${readOnlyStyle} font-mono`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileView;

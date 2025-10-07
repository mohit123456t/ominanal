'use client';
import React, { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

const ProfileView = ({ userProfile: initialProfile }: { userProfile: any, onProfileUpdate: (profile: any) => void }) => {
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
    
    if (!initialProfile) {
        return (
            <div className="flex justify-center items-center h-full">
                <LoaderCircle className="w-12 h-12 animate-spin text-indigo-600"/>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
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
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-500">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        readOnly={!isEditing}
                        className="w-full mt-1 p-2 border rounded-md bg-slate-50 read-only:bg-slate-100 disabled:cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-500">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className="w-full mt-1 p-2 border rounded-md bg-slate-100 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-500">Script ID</label>
                    <input
                        type="text"
                        value={formData.scriptId}
                        readOnly
                        className="w-full mt-1 p-2 border rounded-md bg-slate-100 cursor-not-allowed font-mono"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileView;

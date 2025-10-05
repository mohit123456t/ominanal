'use client';
import React, { useState } from 'react';

const ProfileView = ({ userProfile, onProfileUpdate }: { userProfile: any, onProfileUpdate: (profile: any) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(userProfile);

    const handleSave = () => {
        // Placeholder for saving data
        alert('Profile updated! (This is a demo)');
        onProfileUpdate(formData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
                <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-500">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        readOnly={!isEditing}
                        className="w-full mt-1 p-2 border rounded-md bg-slate-50 read-only:bg-slate-100"
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
                    <label className="text-sm font-medium text-slate-500">Role</label>
                    <input
                        type="text"
                        value={formData.role}
                        readOnly
                        className="w-full mt-1 p-2 border rounded-md bg-slate-100 cursor-not-allowed"
                    />
                </div>
                 {isEditing && (
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">
                        Cancel
                    </button>
                 )}
            </div>
        </div>
    );
};

export default ProfileView;

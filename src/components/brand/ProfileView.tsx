'use client';
import React, { useState } from 'react';

const ProfileView = ({ user, profile, onUpdateProfile }: { user: any; profile: any; onUpdateProfile: (profile: any) => void; }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profile);

    const handleSave = () => {
        onUpdateProfile(formData);
        setIsEditing(false);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold">Profile</h2>
            {isEditing ? (
                <div>
                    <label>Name: <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></label>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div>
                    <p>Name: {profile.name}</p>
                    <p>Brand: {profile.brandName}</p>
                    <p>Email: {user?.email}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </div>
            )}
        </div>
    );
};

export default ProfileView;

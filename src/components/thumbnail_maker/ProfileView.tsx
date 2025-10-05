'use client';
import React from 'react';

const ProfileView = ({ userProfile }: { userProfile: any }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p>This is a placeholder for the Profile view.</p>
            <p>User: {userProfile?.name}</p>
        </div>
    );
};

export default ProfileView;

'use client';
import React, { useState, useEffect } from 'react';

const ProfileSkeleton = () => (
    <div className="animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="flex items-center mb-10">
            <div className="w-24 h-24 bg-slate-200 rounded-full mr-6"></div>
            <div className="flex-1">
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-5 bg-slate-200 rounded w-1/2"></div>
            </div>
        </div>

        {/* Account Details Skeleton */}
        <div className="space-y-4">
             <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-100 p-4 rounded-lg h-20"></div>
                <div className="bg-slate-100 p-4 rounded-lg h-20"></div>
                <div className="bg-slate-100 p-4 rounded-lg h-20"></div>
                <div className="bg-slate-100 p-4 rounded-lg h-20"></div>
             </div>
        </div>
    </div>
);


const ProfileView = ({ userProfile }: { userProfile: any }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading delay, remove this in production if data loads instantly
        const timer = setTimeout(() => {
            if (userProfile) {
                setLoading(false);
            }
        }, 500); // 0.5 second delay to show skeleton

        return () => clearTimeout(timer);
    }, [userProfile]);


    if (loading || !userProfile) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="flex items-center mb-10 p-4 bg-white rounded-xl shadow-sm border border-slate-200/80">
                <img 
                    src={userProfile.photoURL || `https://ui-avatars.com/api/?name=${userProfile.name}&background=random`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mr-6 border-4 border-slate-100 object-cover"
                />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{userProfile.name}</h1>
                    <p className="text-slate-600">{userProfile.email}</p>
                </div>
            </div>

            {/* Account Details */}
            <div>
                 <h2 className="text-2xl font-bold text-slate-700 mb-4">Account Details</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/80">
                         <p className="text-sm text-slate-500 font-medium">User ID</p>
                         <p className="text-slate-800 font-mono text-sm">{'TM' + (userProfile.uid || 'xxxx').slice(-4)}</p>
                     </div>
                     <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/80">
                         <p className="text-sm text-slate-500 font-medium">Member Since</p>
                         <p className="text-slate-800">{userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
                     </div>
                      <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/80">
                         <p className="text-sm text-slate-500 font-medium">Role</p>
                         <p className="text-slate-800 font-semibold">{userProfile.role}</p>
                     </div>
                      <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/80">
                         <p className="text-sm text-slate-500 font-medium">Status</p>
                         <p className="text-green-600 font-semibold capitalize">Active</p>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default ProfileView;

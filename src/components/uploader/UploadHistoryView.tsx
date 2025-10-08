'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Post } from '@/lib/types';

const UploadHistoryView = ({ posts, isLoading }: { posts: Post[], isLoading: boolean }) => {

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-slate-100 text-slate-800';
            case 'Failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-8"><LoaderCircle className="h-8 w-8 animate-spin mx-auto"/></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Upload History</h1>
                <p className="text-slate-600">A complete record of all your uploads.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Content</th>
                            <th className="px-6 py-3">Platform</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(upload => (
                            <tr key={upload.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 line-clamp-1">{upload.content}</td>
                                <td className="px-6 py-4 capitalize">{upload.platform}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(upload.status)}`}>
                                        {upload.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(upload.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <button className="text-sm font-medium text-blue-600 hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {posts.length === 0 && <p className="text-center p-8 text-slate-500">No uploads found.</p>}
            </div>
        </div>
    );
};

export default UploadHistoryView;

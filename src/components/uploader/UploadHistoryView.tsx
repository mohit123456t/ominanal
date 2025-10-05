'use client';
import React, { useState, useEffect } from 'react';

const UploadHistoryView = ({ userProfile }: { userProfile: any }) => {
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Placeholder data
        const placeholderUploads = [
             { id: 'up1', reelTitle: 'Summer Fashion Reel', campaign: 'Summer Sale', status: 'Completed', date: new Date().toISOString() },
            { id: 'up2', reelTitle: 'Diwali Special Reel', campaign: 'Diwali Dhamaka', status: 'Pending', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 'up3', reelTitle: 'Product Launch Teaser', campaign: 'New Gadget', status: 'Completed', date: new Date(Date.now() - 2 * 86400000).toISOString() },
            { id: 'up4', reelTitle: 'Monsoon Skincare', campaign: 'Skincare Essentials', status: 'Rejected', date: new Date(Date.now() - 3 * 86400000).toISOString() },
        ];
        setUploads(placeholderUploads);
        setLoading(false);
    }, []);

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    if (loading) {
        return <div className="text-center p-8">Loading upload history...</div>;
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
                            <th className="px-6 py-3">Reel Title</th>
                            <th className="px-6 py-3">Campaign</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploads.map(upload => (
                            <tr key={upload.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{upload.reelTitle}</td>
                                <td className="px-6 py-4">{upload.campaign}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(upload.status)}`}>
                                        {upload.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(upload.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <button className="text-sm font-medium text-blue-600 hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {uploads.length === 0 && <p className="text-center p-8 text-slate-500">No uploads found.</p>}
            </div>
        </div>
    );
};

export default UploadHistoryView;

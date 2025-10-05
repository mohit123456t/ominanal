'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, DollarSign, Video, Calendar, X, LoaderCircle } from 'lucide-react';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';


// Helper components
const InfoPill = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="bg-white/40 border border-slate-300/50 rounded-lg p-3 flex items-start">
        <span className="text-lg text-indigo-600 mr-3">{icon}</span>
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="font-semibold text-slate-800">{value || 'N/A'}</p>
        </div>
    </div>
);

const StaffDisplay = ({ role, staffName, staffEmail }: { role: string, staffName?: string, staffEmail?: string }) => {
    return (
        <div className="bg-white/40 border border-slate-300/50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-600 capitalize">{role.replace('_', ' ')}</p>
            <p className="font-semibold text-slate-900 mt-1">{staffName || 'Not Assigned'}</p>
            {staffEmail && <p className="text-xs text-slate-500">{staffEmail}</p>}
        </div>
    );
};

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
            isActive
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-indigo-500 hover:border-slate-300'
        }`}
    >
        {label}
    </button>
);

const CampaignDetailView = ({ campaignId, onClose }: { campaignId: string, onClose: () => void }) => {
    const { firestore } = useFirebase();

    // Fetch campaign, users, and work items
    const campaignDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'campaigns', campaignId) : null, [firestore, campaignId]);
    const { data: campaign, isLoading: campaignLoading } = useDoc<any>(campaignDocRef);

    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

    const workItemsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'work_items'), where('campaignId', '==', campaignId)) : null, [firestore, campaignId]);
    const { data: workItems, isLoading: workItemsLoading } = useCollection<any>(workItemsQuery);

    const [activeTab, setActiveTab] = useState('scripts');

    const loading = campaignLoading || usersLoading || workItemsLoading;
    
    // Process data once loaded
    const staffAssignments = useMemo(() => {
        if (!campaign || !users) return {};
        const assignments: { [key: string]: any } = {};
        const roles = ['Uploader', 'VideoEditor', 'ScriptWriter', 'ThumbnailMaker'];
        roles.forEach(role => {
            const staffId = campaign[`assigned${role}`];
            if (staffId) {
                const staffMember = users.find(u => u.uid === staffId);
                assignments[role] = staffMember;
            }
        });
        return assignments;
    }, [campaign, users]);
    
    const categorizedWorkItems = useMemo(() => {
        if (!workItems) return { scripts: [], videos: [], thumbnails: [], uploads: [] };
        return workItems.reduce((acc, item) => {
            if (item.type) {
                const typeKey = `${item.type.toLowerCase()}s`;
                if (!acc[typeKey]) acc[typeKey] = [];
                acc[typeKey].push(item);
            }
            return acc;
        }, {} as any);
    }, [workItems]);


    if (loading) return <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"><LoaderCircle className="w-12 h-12 animate-spin text-white"/></div>;
    if (!campaign) return <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"><div className="bg-white/50 p-8 rounded-2xl text-slate-800">Campaign not found.</div></div>;

    const renderContent = () => {
        const items = categorizedWorkItems[activeTab] || [];
        if (items.length === 0) {
            return <div className="text-center py-10 text-slate-500">No items found for this category.</div>;
        }

        switch(activeTab) {
            case 'scripts':
                return items.map((item: any) => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50">
                        <p className="font-semibold text-slate-800">{item.videoTitle || 'Script'}</p>
                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{item.content}</p>
                    </div>
                ));
            case 'videos':
                 return items.map((item: any) => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50">
                        <p className="font-semibold text-slate-800">{item.videoTitle || 'Edited Video'}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View/Download Video</a>
                    </div>
                ));
            case 'thumbnails':
                 return items.map((item: any) => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50 flex items-center gap-4">
                        <img src={item.url} alt="Thumbnail" className="w-24 h-24 object-cover rounded-md" />
                        <div>
                             <p className="font-semibold text-slate-800">{item.videoTitle || 'Thumbnail'}</p>
                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View Full Size</a>
                        </div>
                    </div>
                ));
            case 'uploads':
                return items.map((item: any) => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50">
                         <p className="font-semibold text-slate-800">{item.title}</p>
                         <p className="text-sm text-slate-500">Uploaded on: {item.uploadedAt ? new Date(item.uploadedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                    </div>
                ));
            default: return null;
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col border border-slate-300/70"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
                <div className="p-6 border-b border-slate-300/70 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{campaign.name}</h2>
                        <p className="text-sm text-slate-500">Campaign Details & Work Progress</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-500/10 transition-colors"><X /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Campaign Brief Section */}
                    <div className="bg-white/30 border border-slate-300/50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Campaign Brief</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <InfoPill icon={<Briefcase />} label="Brand Name" value={campaign.brandName} />
                            <InfoPill icon={<DollarSign />} label="Budget" value={`₹${campaign.budget?.toLocaleString()}`} />
                            <InfoPill icon={<Video />} label="Expected Reels" value={campaign.expectedReels} />
                            <InfoPill icon={<Calendar />} label="Deadline" value={new Date(campaign.deadline).toLocaleDateString()} />
                        </div>
                        <div>
                             <p className="text-sm font-medium text-slate-600 mb-1.5">Description</p>
                             <p className="text-slate-700 bg-white/30 p-3 rounded-lg border border-slate-300/50 whitespace-pre-wrap">{campaign.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    {/* Assigned Staff Section */}
                     <div className="bg-white/30 border border-slate-300/50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Assigned Staff</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StaffDisplay role="Uploader" staffName={staffAssignments.Uploader?.name} staffEmail={staffAssignments.Uploader?.email} />
                            <StaffDisplay role="Video Editor" staffName={staffAssignments.VideoEditor?.name} staffEmail={staffAssignments.VideoEditor?.email} />
                            <StaffDisplay role="Script Writer" staffName={staffAssignments.ScriptWriter?.name} staffEmail={staffAssignments.ScriptWriter?.email} />
                            <StaffDisplay role="Thumbnail Maker" staffName={staffAssignments.ThumbnailMaker?.name} staffEmail={staffAssignments.ThumbnailMaker?.email} />
                        </div>
                    </div>

                    {/* Work Progress Section */}
                    <div className="bg-white/30 border border-slate-300/50 rounded-xl">
                        <div className="px-6 pt-4">
                            <h3 className="text-xl font-bold text-slate-800">Work Progress</h3>
                            <div className="border-b border-slate-300/70 mt-2">
                                <TabButton label={`Scripts (${categorizedWorkItems.scripts?.length || 0})`} isActive={activeTab === 'scripts'} onClick={() => setActiveTab('scripts')} />
                                <TabButton label={`Edited Videos (${categorizedWorkItems.videos?.length || 0})`} isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
                                <TabButton label={`Thumbnails (${categorizedWorkItems.thumbnails?.length || 0})`} isActive={activeTab === 'thumbnails'} onClick={() => setActiveTab('thumbnails')} />
                                <TabButton label={`Uploaded Reels (${categorizedWorkItems.uploads?.length || 0})`} isActive={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} />
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                           <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderContent()}
                                </motion.div>
                           </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CampaignDetailView;

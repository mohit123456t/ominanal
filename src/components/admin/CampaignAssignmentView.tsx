'use client';
import React, { useState, useEffect } from 'react';
import { X, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const AssignmentDropdown = ({ label, value, onChange, users, role, isVisible = true }: {label:string, value:string, onChange:(val: string)=>void, users: any[], role:string, isVisible?: boolean}) => {
    if (!isVisible) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/80 p-5 rounded-2xl border-2 border-slate-200/90 shadow-sm transition-all duration-300 focus-within:shadow-lg focus-within:border-indigo-300"
        >
            <label htmlFor={`${role}-select`} className="block mb-2.5 text-base font-bold text-slate-800 tracking-tight">{label}</label>
            <select 
                id={`${role}-select`} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="w-full p-3 bg-white rounded-xl border-2 border-slate-300/80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-slate-900 font-medium"
            >
                <option value="">-- Not Assigned --</option>
                {users.length > 0 ? (
                    users.map(user => <option key={user.uid} value={user.uid} className="font-medium">{user.name} ({user.email})</option>)
                ) : (
                    <option disabled>No users found with role: '{role}'</option>
                )}
            </select>
        </motion.div>
    );
};


const CampaignAssignmentView = ({ campaignId, onClose }: { campaignId: string, onClose: ()=>void}) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    // Fetch campaign details
    const campaignDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'campaigns', campaignId) : null, [firestore, campaignId]);
    const { data: campaign, isLoading: campaignLoading, error: campaignError } = useDoc<any>(campaignDocRef);

    // Fetch users for each role
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: allUsers, isLoading: usersLoading, error: usersError } = useCollection(usersQuery);

    const [usersByRole, setUsersByRole] = useState<{ [key: string]: any[] }>({});
    const [selections, setSelections] = useState({ uploader: '', videoEditor: '', scriptWriter: '', thumbnailMaker: '' });
    
    const serviceLevel = campaign?.serviceLevel || 'manual';

    useEffect(() => {
        if (allUsers) {
            const roles = ['uploader', 'video_editor', 'script_writer', 'thumbnail_maker'];
            const categorizedUsers = roles.reduce((acc, role) => {
                acc[role] = allUsers.filter(u => u.role === role);
                return acc;
            }, {} as { [key: string]: any[] });
            setUsersByRole(categorizedUsers);
        }
    }, [allUsers]);
    
    useEffect(() => {
        if (campaign) {
            setSelections({
                uploader: campaign.assignedUploader || '',
                videoEditor: campaign.assignedVideoEditor || '',
                scriptWriter: campaign.assignedScriptWriter || '',
                thumbnailMaker: campaign.assignedThumbnailMaker || '',
            });
        }
    }, [campaign]);


    const handleAssign = async () => {
        if (!campaignDocRef) return;
        try {
            await updateDoc(campaignDocRef, {
                assignedUploader: selections.uploader,
                assignedVideoEditor: selections.videoEditor,
                assignedScriptWriter: selections.scriptWriter,
                assignedThumbnailMaker: selections.thumbnailMaker,
                status: 'Active' // Move to active after assignment
            });
            toast({ title: "Success!", description: "Staff has been assigned to the campaign." });
            onClose();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: `Failed to assign staff: ${error.message}` });
        }
    };
    
    const handleSelectionChange = (role: string, value: string) => {
        setSelections(prev => ({ ...prev, [role]: value }));
    };
    
    const loading = campaignLoading || usersLoading;
    const error = campaignError || usersError;

    if (loading || error) return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
             {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
             ) : (
                <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-sm">
                    <h3 className="text-xl font-bold text-red-600">An Error Occurred</h3>
                    <p className="text-slate-600 mt-2 text-sm">{error?.message || 'Failed to load data.'}</p>
                    <button onClick={onClose} className="mt-6 px-6 py-2 bg-slate-200 rounded-lg text-slate-800 font-semibold hover:bg-slate-300">Close</button>
                </div>
             )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 font-sans">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="bg-slate-200/80 rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
                <header className="sticky top-0 z-10 flex justify-between items-center p-5 border-b border-slate-900/10 bg-slate-200/70 backdrop-blur-lg flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Assign Roles: <span className='text-indigo-600'>{campaign?.name}</span></h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-600 hover:bg-slate-900/10 hover:text-slate-800 transition-colors"><X /></button>
                </header>

                <main className="overflow-y-auto flex-1 p-6 md:p-8">
                     <div className="space-y-6 max-w-lg mx-auto">
                        <AssignmentDropdown label="Uploader" value={selections.uploader} onChange={val => handleSelectionChange('uploader', val)} users={usersByRole.uploader || []} role="uploader" isVisible={true} />
                        <AssignmentDropdown label="Video Editor" value={selections.videoEditor} onChange={val => handleSelectionChange('videoEditor', val)} users={usersByRole.video_editor || []} role="videoEditor" isVisible={serviceLevel !== 'reels-only'} />
                        <AssignmentDropdown label="Script Writer" value={selections.scriptWriter} onChange={val => handleSelectionChange('scriptWriter', val)} users={usersByRole.script_writer || []} role="scriptWriter" isVisible={serviceLevel === 'manual'} />
                        <AssignmentDropdown label="Thumbnail Maker" value={selections.thumbnailMaker} onChange={val => handleSelectionChange('thumbnailMaker', val)} users={usersByRole.thumbnail_maker || []} role="thumbnailMaker" isVisible={serviceLevel === 'manual'} />
                    </div>
                </main>

                <footer className="sticky bottom-0 z-10 flex justify-end p-5 border-t border-slate-900/10 bg-slate-200/70 backdrop-blur-lg flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-900/10 transition-colors mr-3">Cancel</button>
                    <button onClick={handleAssign} className="flex items-center px-7 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5">
                        Save Assignments
                    </button>
                </footer>
            </motion.div>
        </div>
    );
};

export default CampaignAssignmentView;

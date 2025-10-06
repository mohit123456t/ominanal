'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Download, File, LoaderCircle, MessageSquare, Scissors, Upload, XCircle, BrainCircuit } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { generateAiCaption } from '@/ai/flows/ai-caption-generation';


const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses: { [key: string]: string } = {
        "Active": "bg-green-100 text-green-800",
        "Completed": "bg-slate-200 text-slate-800",
        "Pending": "bg-yellow-100 text-yellow-800",
        "In Progress": "bg-blue-100 text-blue-800",
        "Submitted": "bg-purple-100 text-purple-800",
        "Approved": "bg-green-100 text-green-800",
        "Revision": "bg-orange-100 text-orange-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>{status}</span>;
};

const TaskDetailsView = ({ task: initialTask, onClose }: { task: any, onClose: () => void }) => {
    if (!initialTask) return null;
    
    const firestore = useFirestore();
    const { toast } = useToast();
    const [task, setTask] = useState(initialTask);
    const [scriptContent, setScriptContent] = useState(initialTask.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAIScript = async () => {
        setIsGenerating(true);
        try {
            const result = await generateAiCaption({
                topic: task.videoTitle || 'a social media video',
                contentType: 'script',
                tone: 'Witty', // or make this dynamic
            });
            if (result.caption) {
                setScriptContent(result.caption);
                toast({ title: "AI Script Generated!", description: "The AI has drafted a script for you." });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "AI Error", description: "Failed to generate AI script." });
        } finally {
            setIsGenerating(false);
        }
    };

    // Auto-generate script on first load if content is empty
    useEffect(() => {
        if (!initialTask.content) {
            handleGenerateAIScript();
        }
    }, [initialTask.content]);
    
    const handleSaveChanges = async () => {
        if (!firestore) return;
        setIsSaving(true);
        const taskRef = doc(firestore, 'work_items', task.id);
        try {
            await updateDoc(taskRef, {
                content: scriptContent,
                status: 'Submitted', // Automatically set status to submitted
                updatedAt: new Date().toISOString(),
            });
            setTask({ ...task, content: scriptContent, status: 'Submitted' });
            toast({ title: "Success!", description: "Your script has been submitted for review." });
            onClose(); // Close modal on success
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Save failed", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans" onClick={onClose}>
        <motion.div 
            className="bg-slate-100/90 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-slate-300/70" 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="p-5 border-b border-slate-300/50 flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Task: {task.videoTitle}</h2>
                    <p className="text-sm text-slate-500">Campaign: {task.campaignName}</p>
                </div>
                <StatusBadge status={task.status} />
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">AI-Powered Script Editor</h3>
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={handleGenerateAIScript}
                                    disabled={isGenerating}
                                    className="flex items-center text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 disabled:opacity-50"
                                >
                                    {isGenerating ? <LoaderCircle size={14} className="animate-spin mr-1.5" /> : <BrainCircuit size={14} className="mr-1.5" />}
                                    {isGenerating ? 'Regenerating...' : 'Regenerate with AI'}
                                </button>
                            </div>
                             <textarea 
                                placeholder="Your script will appear here. You can edit it before submitting." 
                                rows={15} 
                                className="w-full p-3 border border-slate-300 rounded-md text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={scriptContent}
                                onChange={(e) => setScriptContent(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                     <div className="space-y-6">
                        <div className="bg-white/50 p-4 rounded-lg border border-slate-200">
                             <h3 className="font-bold text-lg mb-3 text-slate-800">Task Info</h3>
                              <div className="space-y-2 text-sm">
                                <p><strong className="text-slate-600">Deadline:</strong> <span className="font-semibold text-red-600">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span></p>
                                <p><strong className="text-slate-600">Brand:</strong> <span className="font-semibold">{task.brandName}</span></p>
                              </div>
                        </div>
                        <div className="bg-white/50 p-4 rounded-lg border border-slate-200">
                             <h3 className="font-bold text-lg mb-3 text-slate-800">Description</h3>
                             <p className="text-sm text-slate-600">{task.description || "No description provided."}</p>
                        </div>
                     </div>
                 </div>
            </div>
            <div className="p-5 flex justify-end space-x-3 border-t border-slate-300/50 bg-slate-100/80 rounded-b-2xl">
                <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg">Cancel</button>
                <button onClick={handleSaveChanges} disabled={isSaving || !scriptContent} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 shadow-lg shadow-indigo-500/20">
                     {isSaving ? <LoaderCircle size={18} className="animate-spin mr-2"/> : <CheckCircle size={16} className="mr-2"/>}
                    {isSaving ? 'Approving...' : 'Approve & Submit Script'}
                </button>
            </div>
        </motion.div>
        </div>
    );
};

const TasksView = ({ tasks, isLoading }: { tasks: any[], isLoading: boolean }) => {
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    
    const handleOpenModal = (task: any) => {
        setSelectedTask(task);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
            <div className="p-4 border-b">
                 <h3 className="font-bold text-lg text-slate-800 mb-2">Assigned Tasks for Script Review</h3>
            </div>
            <div className="p-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                        <h3 className="text-lg font-semibold text-slate-900 mt-4">Loading Tasks...</h3>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-4 text-4xl mx-auto w-fit">📝</div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks assigned</h3>
                        <p className="text-slate-600">You have no active script-writing tasks.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-slate-800">{task.videoTitle}</h4>
                                    <StatusBadge status={task.status} />
                                </div>
                                <p className="text-xs text-slate-500 mb-2">Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</p>
                                <button onClick={() => handleOpenModal(task)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Review AI Script
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <AnimatePresence>
              {selectedTask && <TaskDetailsView task={selectedTask} onClose={() => setSelectedTask(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default TasksView;

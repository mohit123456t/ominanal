'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Download, File, LoaderCircle, MessageSquare, Scissors, Upload, XCircle, BrainCircuit, Clipboard } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { generateAiScript } from '@/ai/flows/ai-script-generation';


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
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>{status}</span>;
};

const TaskDetailsView = ({ task: initialTask, onClose }: { task: any, onClose: () => void }) => {
    if (!initialTask) return null;
    
    const firestore = useFirestore();
    const { toast } = useToast();
    const [task, setTask] = useState(initialTask);
    const [scriptContent, setScriptContent] = useState(initialTask.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAIScript = useCallback(async () => {
        if (!task.videoTitle) return;
        setIsGenerating(true);
        try {
            const result = await generateAiScript({
                topic: task.videoTitle,
                tone: 'Witty', // You can make this dynamic if needed
            });
            if (result.script) {
                setScriptContent(result.script);
                toast({ title: "AI Script Generated!", description: "The AI has drafted a script for you." });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "AI Error", description: "Failed to generate AI script." });
        } finally {
            setIsGenerating(false);
        }
    }, [task.videoTitle, toast]);

    useEffect(() => {
        if (!initialTask.content) {
            handleGenerateAIScript();
        }
    }, [initialTask.content, handleGenerateAIScript]);
    
    const handleSaveChanges = async () => {
        if (!firestore) return;
        setIsSaving(true);
        const taskRef = doc(firestore, 'work_items', task.id);
        try {
            await updateDoc(taskRef, {
                content: scriptContent,
                status: 'Submitted',
                updatedAt: new Date().toISOString(),
            });
            setTask({ ...task, content: scriptContent, status: 'Submitted' });
            toast({ title: "Success!", description: "Your script has been submitted for review." });
            onClose();
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
            <div className="p-6 border-b border-slate-300/50 flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Task: {task.videoTitle}</h2>
                    <p className="text-sm text-slate-500">Campaign: {task.campaignName}</p>
                </div>
                <StatusBadge status={task.status} />
            </div>
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/60 p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-lg mb-3 text-slate-800 flex items-center">
                                <BrainCircuit className="mr-2 text-indigo-600"/>AI-Powered Script Editor
                            </h3>
                            <div className="flex justify-end mb-3">
                                <button
                                    onClick={handleGenerateAIScript}
                                    disabled={isGenerating}
                                    className="flex items-center text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 disabled:opacity-50"
                                >
                                    {isGenerating ? <LoaderCircle size={16} className="animate-spin mr-1.5" /> : <BrainCircuit size={16} className="mr-1.5" />}
                                    {isGenerating ? 'Regenerating...' : 'Regenerate with AI'}
                                </button>
                            </div>
                             <textarea 
                                placeholder={isGenerating ? "AI is writing, please wait..." : "Your script will appear here. You can edit it before submitting."} 
                                rows={15} 
                                className="w-full p-4 border border-slate-300 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none bg-white/70"
                                value={scriptContent}
                                onChange={(e) => setScriptContent(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                     <div className="space-y-6">
                        <div className="bg-white/60 p-5 rounded-2xl border border-slate-200 shadow-sm">
                             <h3 className="font-bold text-lg mb-4 text-slate-800">Task Info</h3>
                              <div className="space-y-3 text-sm">
                                <p><strong className="text-slate-600 block">Deadline:</strong> <span className="font-semibold text-red-600">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span></p>
                                <p><strong className="text-slate-600 block">Brand:</strong> <span className="font-semibold text-slate-800">{task.brandName}</span></p>
                              </div>
                        </div>
                        <div className="bg-white/60 p-5 rounded-2xl border border-slate-200 shadow-sm">
                             <h3 className="font-bold text-lg mb-3 text-slate-800">Description</h3>
                             <p className="text-sm text-slate-600 leading-relaxed">{task.description || "No description provided."}</p>
                        </div>
                     </div>
                 </div>
            </div>
            <div className="p-5 flex justify-end space-x-3 border-t border-slate-300/50 bg-slate-100/80 rounded-b-2xl flex-shrink-0">
                <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-900/10 transition-colors">Cancel</button>
                <button onClick={handleSaveChanges} disabled={isSaving || !scriptContent} className="flex items-center px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 shadow-lg shadow-indigo-500/30">
                     {isSaving ? <LoaderCircle size={18} className="animate-spin mr-2"/> : <CheckCircle size={16} className="mr-2"/>}
                    {isSaving ? 'Submitting...' : 'Approve & Submit Script'}
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <div className="p-0">
                 <h3 className="font-bold text-xl text-slate-800">Assigned Tasks for Script Review</h3>
            </div>
            <div className="mt-4">
                {isLoading ? (
                    <div className="text-center py-12">
                        <LoaderCircle className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
                        <h3 className="text-lg font-semibold text-slate-700 mt-4">Loading Tasks...</h3>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-slate-400 mb-4 text-5xl mx-auto w-fit">📝</div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No tasks assigned</h3>
                        <p className="text-slate-500">You're all caught up! Check back later for new script assignments.</p>
                    </div>
                ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Video Title</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{task.videoTitle}</td>
                                        <td className="px-6 py-4"><StatusBadge status={task.status} /></td>
                                        <td className="px-6 py-4 text-slate-600">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenModal(task)} className="font-medium text-blue-600 hover:underline">
                                                Review AI Script
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

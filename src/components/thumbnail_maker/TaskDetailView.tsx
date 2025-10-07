'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle, Upload, BrainCircuit, LoaderCircle, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateThumbnailPrompts } from '@/ai/flows/ai-thumbnail-generation';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const TaskDetailView = ({ task, onBack, userProfile }: { task: any, onBack: () => void, userProfile: any }) => {
    const [currentTask, setCurrentTask] = useState(task);
    const [status, setStatus] = useState(task.status);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [thumbnailPrompts, setThumbnailPrompts] = useState<string[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    
    const { toast } = useToast();
    const { firestore } = useFirestore();

    const handleGenerateThumbnails = useCallback(async () => {
        if (!currentTask?.videoTitle) return;
        setIsGenerating(true);
        setThumbnailPrompts([]);
        try {
            const result = await generateThumbnailPrompts({ prompt: currentTask.videoTitle });
            if(result.prompts) {
                setThumbnailPrompts(result.prompts);
                toast({ title: "AI Thumbnail Prompts Generated!", description: "Review the concepts below." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "AI Error", description: "Failed to generate thumbnail ideas." });
        } finally {
            setIsGenerating(false);
        }
    }, [currentTask?.videoTitle, toast]);

    useEffect(() => {
        setCurrentTask(task);
        setStatus(task.status);
        if(!task.thumbnailPrompts || task.thumbnailPrompts.length === 0){
            handleGenerateThumbnails();
        } else {
            setThumbnailPrompts(task.thumbnailPrompts);
        }
    }, [task, handleGenerateThumbnails]);
    
    
    const handleApproveAndSubmit = async () => {
        if (!selectedPrompt || !firestore) {
            toast({ variant: 'destructive', title: 'No Prompt Selected', description: 'Please select an AI-generated prompt to submit.' });
            return;
        }

        setIsSubmitting(true);
        const taskRef = doc(firestore, 'work_items', currentTask.id);
        try {
            await updateDoc(taskRef, {
                status: 'Completed',
                content: selectedPrompt, // Save the selected prompt
                notes: `Submitted AI thumbnail prompt.`,
                completedAt: new Date().toISOString(),
            });
            toast({ title: "Prompt Approved!", description: "The thumbnail prompt has been submitted for final review." });
            onBack();
        } catch(error: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }


    if (!currentTask) {
        return <div className="p-6">No task selected. Go back to the dashboard to select a task.</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                <span>Back to Tasks</span>
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{currentTask.videoTitle}</h1>
                    <p className="text-slate-500 mt-1">Task ID: {currentTask.id}</p>
                </div>
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full bg-blue-100 text-blue-800`}>
                    {currentTask.status}
                </span>
            </div>

            <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-lg mb-3 text-slate-800 flex items-center">
                            <BrainCircuit className="mr-2 text-indigo-600"/>AI Thumbnail Studio
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">AI has generated these thumbnail prompts based on the video content. Review them, select one, or regenerate for new ideas.</p>
                        <button 
                            onClick={handleGenerateThumbnails}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 font-semibold"
                        >
                            {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <ImageIcon className="mr-2"/>}
                            {isGenerating ? 'Generating Ideas...' : 'Regenerate Prompts with AI'}
                        </button>
                        
                        {(isGenerating && thumbnailPrompts.length === 0) && (
                            <div className="mt-4 text-center text-slate-600">Generating new ideas...</div>
                        )}
                        
                        {thumbnailPrompts.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {thumbnailPrompts.map((prompt, index) => (
                                    <div key={index} className={`group cursor-pointer relative rounded-lg p-3 border-2 transition-all ${selectedPrompt === prompt ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`} onClick={() => setSelectedPrompt(prompt)}>
                                        <p className="text-xs text-slate-700">{prompt}</p>
                                        {selectedPrompt === prompt && <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-0.5"><CheckCircle className="text-white w-3 h-3"/></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg space-y-4 h-fit">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Task Info</h3>
                    <div className="text-sm">
                        <p className="font-medium text-slate-500">Assigned On</p>
                        <p className="text-slate-900 font-semibold">{currentTask.createdAt ? new Date(currentTask.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                    </div>
                     <div className="text-sm">
                        <p className="font-medium text-slate-500">Campaign</p>
                        <p className="text-slate-900 font-semibold">{currentTask.campaignName || 'N/A'}</p>
                    </div>
                    <div>
                         <button 
                            onClick={handleApproveAndSubmit}
                            disabled={!selectedPrompt || isSubmitting}
                            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center disabled:bg-green-400"
                        >
                            {isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : <CheckCircle className="mr-2 h-5 w-5" />}
                            {isSubmitting ? 'Submitting...' : 'Approve & Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailView;

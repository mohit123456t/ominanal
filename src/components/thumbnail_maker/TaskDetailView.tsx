'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Download, File, Upload, BrainCircuit, LoaderCircle, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock AI function for generating thumbnail ideas
const generateThumbnailIdeas = async (prompt: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    return [
        { id: 'idea1', url: `https://picsum.photos/seed/${prompt.slice(0,5)}1/400/225`, prompt: 'Bold text, vibrant colors' },
        { id: 'idea2', url: `https://picsum.photos/seed/${prompt.slice(0,5)}2/400/225`, prompt: 'Minimalist, clean design' },
        { id: 'idea3', url: `https://picsum.photos/seed/${prompt.slice(0,5)}3/400/225`, prompt: 'Action shot, dramatic lighting' },
    ];
};


const TaskDetailView = ({ task, onBack, userProfile }: { task: any, onBack: () => void, userProfile: any }) => {
    const [currentTask, setCurrentTask] = useState(task);
    const [status, setStatus] = useState(task.status);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [thumbnailIdeas, setThumbnailIdeas] = useState<any[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        setCurrentTask(task);
        setStatus(task.status);
    }, [task]);
    
    const handleUpdateTask = async () => {
        if (!currentTask?.id) return;
        setLoading(true);
        setError('');
        try {
            // Placeholder for update logic
            console.log("Updating task:", { id: currentTask.id, status, notes });
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            setCurrentTask({ ...currentTask, status });
            setNotes('');
            toast({ title: "Task Updated!", description: "The task status has been updated." });
        } catch (err) {
            console.error("Error updating task:", err);
            setError('Failed to update the task. Please try again.');
            toast({ variant: "destructive", title: "Error", description: "Failed to update task." });
        } finally {
            setLoading(false);
        }
    };
    
    const handleFileUpload = () => {
        // Placeholder for file upload logic
        toast({ title: "Upload Clicked", description: "File upload functionality would be here." });
    }

    const handleGenerateThumbnails = async () => {
        setIsGenerating(true);
        setThumbnailIdeas([]);
        try {
            const ideas = await generateThumbnailIdeas(currentTask.videoTitle);
            setThumbnailIdeas(ideas);
            toast({ title: "AI Thumbnail Ideas Generated!", description: "Review the concepts below." });
        } catch (error) {
            toast({ variant: "destructive", title: "AI Error", description: "Failed to generate thumbnail ideas." });
        } finally {
            setIsGenerating(false);
        }
    };


    if (!currentTask) {
        return <div className="p-6">No task selected. Go back to the dashboard to select a task.</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                <span>Back to Dashboard</span>
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
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800 mb-2">Task Details</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{currentTask.description || 'No description provided.'}</p>
                    </div>

                     {/* AI Thumbnail Generation */}
                    <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-lg mb-3 text-slate-800 flex items-center">
                            <BrainCircuit className="mr-2 text-indigo-600"/>AI Thumbnail Studio
                        </h3>
                        <button 
                            onClick={handleGenerateThumbnails}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 font-semibold"
                        >
                            {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <ImageIcon className="mr-2"/>}
                            {isGenerating ? 'Generating Ideas...' : 'Generate Thumbnails with AI'}
                        </button>
                        {thumbnailIdeas.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {thumbnailIdeas.map(idea => (
                                    <div key={idea.id} className="group">
                                        <img src={idea.url} alt="AI Thumbnail Idea" className="rounded-lg shadow-md border border-slate-200" />
                                        <p className="text-xs text-center text-slate-600 mt-1">{idea.prompt}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-slate-800 mb-2">Add a Note</h3>
                         <textarea 
                            rows={4}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            placeholder='Add a comment or update for the team...'
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleUpdateTask}
                            disabled={loading}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                         <button 
                            onClick={handleFileUpload}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Final Thumbnail
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Task Info</h3>
                    <div className="text-sm">
                        <p className="font-medium text-slate-500">Assigned On</p>
                        <p className="text-slate-900 font-semibold">{currentTask.assignedAt ? new Date(currentTask.assignedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                     <div className="text-sm">
                        <p className="font-medium text-slate-500">Last Updated</p>
                        <p className="text-slate-900 font-semibold">{currentTask.lastUpdatedAt ? new Date(currentTask.lastUpdatedAt).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailView;

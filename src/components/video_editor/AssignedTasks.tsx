'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, CheckCircle, File, Download, Scissors, MessageSquare, BrainCircuit, LoaderCircle, Clipboard } from 'lucide-react';
import { generateVideoPrompt } from '@/ai/flows/ai-video-generation';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';


interface Campaign {
  id: string;
  assignedEditor?: string;
  status: string;
  name: string;
  reels?: any[];
  description?: string;
  content?: string; // Added for generated prompt
}

const TaskDetailsView = ({ task, onBack }: { task: any, onBack: () => void }) => {
    const [prompt, setPrompt] = useState(task.description || '');
    const [generatedPrompt, setGeneratedPrompt] = useState(task.content || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    
    const handleGenerateVideoPrompt = useCallback(async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is empty', description: 'Please enter a description for the video you want to generate a prompt for.'});
            return;
        }
        setIsGenerating(true);
        setGeneratedPrompt('');
        try {
            const result = await generateVideoPrompt({ prompt });
            setGeneratedPrompt(result.generatedPrompt);
            toast({ title: 'Video Prompt Generated!', description: 'The AI has created a new cinematic prompt for you.'});
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'AI Generation Failed', description: error.message || 'An unknown error occurred.'});
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, toast]);
    
    useEffect(() => {
        if (prompt && !task.content) { // Only auto-generate if there's a prompt and no existing content
            handleGenerateVideoPrompt();
        }
    }, [prompt, task.content, handleGenerateVideoPrompt]);


    const StatusBadge = ({ status }: { status: string }) => {
        const statusClasses: { [key: string]: string } = {
            "Pending Footage": "bg-slate-200 text-slate-800",
            "In-Progress": "bg-blue-100 text-blue-800",
            "Submitted": "bg-yellow-100 text-yellow-800",
            "Approved": "bg-green-100 text-green-800",
        };
        return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        toast({ title: 'Copied to Clipboard!' });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-800 mb-2">
                        <span className="mr-2"><ArrowLeft /></span>
                        Back to Tasks
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">{task.name}</h1>
                </div>
                <div className="text-right">
                    <StatusBadge status={task.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                         <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center"><BrainCircuit className="mr-2 text-indigo-600"/>AI Cinematic Prompt Generator</h3>
                         <p className="text-sm text-slate-600 mb-4">The AI has generated the following video prompt. You can use this in any AI video generator tool.</p>
                         <div className="space-y-3">
                             <textarea 
                                placeholder="e.g., A majestic dragon soaring over a mystical forest at dawn." 
                                rows={3} 
                                className="w-full p-3 border border-slate-300 rounded-md text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleGenerateVideoPrompt}
                                disabled={isGenerating}
                                className="flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 font-semibold"
                            >
                                {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <BrainCircuit className="mr-2"/>}
                                {isGenerating ? 'Regenerating Prompt...' : 'Regenerate Video Prompt'}
                            </button>
                         </div>
                         {isGenerating && !generatedPrompt && (
                             <div className="mt-4 text-center text-sm text-slate-600">
                                Please wait, AI is crafting your prompt...
                             </div>
                         )}
                         {generatedPrompt && (
                             <div className="mt-4">
                                <h4 className="font-semibold text-slate-800 mb-2">Generated Prompt:</h4>
                                <div className="relative">
                                    <textarea value={generatedPrompt} readOnly rows={5} className="w-full p-3 border bg-slate-50 border-slate-200 rounded-md text-sm"/>
                                    <button onClick={handleCopyToClipboard} className="absolute top-2 right-2 p-1.5 bg-slate-200 rounded-md hover:bg-slate-300">
                                        <Clipboard size={16}/>
                                    </button>
                                </div>
                             </div>
                         )}
                    </div>
                </div>

                <div className="space-y-6">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <span className="mr-2"><CheckCircle /></span>
                                Mark as Completed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: { [key: string]: string } = {
    "Pending Footage": "bg-slate-200 text-slate-800",
    "In-Progress": "bg-blue-100 text-blue-800",
    "Submitted": "bg-yellow-100 text-yellow-800",
    "Approved": "bg-green-100 text-green-800",
    "Active": "bg-green-100 text-green-800",
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-700'} cursor-pointer shadow-sm`}
    >
      {status}
    </motion.span>
  );
};


const AssignedTasks = ({ tasks, isLoading }: { tasks: Campaign[], isLoading: boolean }) => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleBackToList = () => {
    setSelectedCampaign(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  if (selectedCampaign) {
    return <TaskDetailsView task={selectedCampaign} onBack={handleBackToList} />;
  }

  return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.h2
          variants={cardVariants}
          className="text-3xl font-extrabold text-slate-800"
        >
          Assigned Video Tasks
        </motion.h2>

        {isLoading ? (
          <div className="text-center py-12"><LoaderCircle className="animate-spin h-8 w-8 mx-auto text-indigo-600" /></div>
        ) : tasks && tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((campaign) => (
              <motion.div
                key={campaign.id}
                variants={cardVariants}
                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600">{campaign.name}</h3>
                  <StatusBadge status={campaign.status} />
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{campaign.description}</p>
                <button
                  onClick={() => handleViewDetails(campaign)}
                  className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm"
                >
                  Review AI Prompt
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">No campaigns assigned.</div>
        )}
      </motion.div>
  );
};

export default AssignedTasks;

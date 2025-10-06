'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, CheckCircle, File, Download, Scissors, MessageSquare, BrainCircuit, LoaderCircle } from 'lucide-react';
import { generateVideo } from '@/ai/flows/ai-video-generation';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


interface Campaign {
  id: string;
  assignedEditor?: string;
  status: string;
  name: string;
  reels?: any[];
  description?: string;
}

const TaskDetailsView = ({ task, onBack }: { task: any, onBack: () => void }) => {
    const [prompt, setPrompt] = useState(task.description || '');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    
    const handleGenerateVideo = useCallback(async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is empty', description: 'Please enter a description for the video you want to generate.'});
            return;
        }
        setIsGenerating(true);
        setGeneratedVideoUrl('');
        try {
            const result = await generateVideo({ prompt });
            setGeneratedVideoUrl(result.videoUrl);
            toast({ title: 'Video Generated!', description: 'The AI has created a new video for you.'});
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'AI Generation Failed', description: error.message || 'An unknown error occurred.'});
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, toast]);
    
    useEffect(() => {
        if (prompt) {
            handleGenerateVideo();
        }
    }, [prompt, handleGenerateVideo]);


    const StatusBadge = ({ status }: { status: string }) => {
        const statusClasses: { [key: string]: string } = {
            "Pending Footage": "bg-slate-200 text-slate-800",
            "In-Progress": "bg-blue-100 text-blue-800",
            "Submitted": "bg-yellow-100 text-yellow-800",
            "Approved": "bg-green-100 text-green-800",
        };
        return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
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
                         <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center"><BrainCircuit className="mr-2 text-indigo-600"/>AI Video Review</h3>
                         <p className="text-sm text-slate-600 mb-4">The AI has generated the following video based on the script. Review it and request changes if needed.</p>
                         <div className="space-y-3">
                             <textarea 
                                placeholder="e.g., A majestic dragon soaring over a mystical forest at dawn." 
                                rows={3} 
                                className="w-full p-3 border border-slate-300 rounded-md text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleGenerateVideo}
                                disabled={isGenerating}
                                className="flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 font-semibold"
                            >
                                {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <BrainCircuit className="mr-2"/>}
                                {isGenerating ? 'Regenerating Video...' : 'Regenerate Video with AI'}
                            </button>
                         </div>
                         {isGenerating && !generatedVideoUrl && (
                             <div className="mt-4 text-center text-sm text-slate-600">
                                Please wait, AI is creating your video. This may take a minute...
                             </div>
                         )}
                         {generatedVideoUrl && (
                             <div className="mt-4">
                                <h4 className="font-semibold text-slate-800 mb-2">Generated Video:</h4>
                                <video src={generatedVideoUrl} controls className="w-full rounded-lg border border-slate-200" />
                                <a href={generatedVideoUrl} download="ai-generated-video.mp4" className="mt-2 inline-flex items-center text-sm text-green-700 hover:underline"><Download className="mr-1 h-4 w-4"/> Download Video</a>
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
                                Approve & Submit
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


const AssignedTasks = () => {
  const { user, firestore } = useFirebase();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const workItemsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'work_items'), where('assignedTo', '==', user.uid), where('type', '==', 'video'));
  }, [user, firestore]);
  
  const { data: campaigns, isLoading: loading } = useCollection<Campaign>(workItemsQuery);

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
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
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

        {loading ? (
          <div className="text-center py-12"><LoaderCircle className="animate-spin h-8 w-8 mx-auto text-indigo-600" /></div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
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
                <p className="text-sm text-slate-500 mb-4">{campaign.description}</p>
                <button
                  onClick={() => handleViewDetails(campaign)}
                  className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm"
                >
                  Review AI Video
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

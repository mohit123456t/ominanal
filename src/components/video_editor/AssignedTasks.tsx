'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, CheckCircle, File, Download, Scissors, MessageSquare, BrainCircuit, LoaderCircle } from 'lucide-react';
import { generateVideo } from '@/ai/flows/ai-video-generation';
import { useToast } from '@/hooks/use-toast';


interface Campaign {
  id: string;
  assignedEditor?: string;
  status: string;
  name: string;
  reels?: any[];
  description?: string;
}

const TaskDetailsView = ({ onBack }: { onBack: () => void }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    // Mock data for task details
    const taskDetails = {
        id: 'V015',
        campaign: 'Summer Glow',
        status: 'In-Progress',
        progress: 60,
        assigned: '2024-01-08',
        deadline: 'In 2 days',
        description: 'Create a 15-second promotional video for a new line of summer skincare products. The vibe should be fresh, sunny, and energetic.',
        requirements: [
            'Add smooth transitions between clips',
            'Include brand overlays and call-to-action',
            'Ensure HD quality (1080p minimum)',
        ],
        assets: [
            { name: 'Raw footage - Makeup Tutorial.mp4', size: '245 MB', uploaded: '2024-01-08' },
            { name: 'Brand Assets.zip', size: '15 MB', uploaded: '2024-01-08' },
        ],
    };
    
    const handleGenerateVideo = async () => {
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
    };


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
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Task Details</h1>
                    <p className="text-slate-600">Complete information about your assigned task</p>
                </div>
                <div className="text-right">
                    <StatusBadge status={taskDetails.status} />
                    <p className="text-sm text-slate-500 mt-1">Progress: {taskDetails.progress}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Video Generation Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                         <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center"><BrainCircuit className="mr-2 text-indigo-600"/>AI Video Generator</h3>
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
                                {isGenerating ? 'Generating Video...' : 'Generate Video with AI'}
                            </button>
                         </div>
                         {isGenerating && (
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
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Task Information</h3>
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Task ID</p>
                                <p className="text-lg font-semibold text-slate-800">{taskDetails.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Campaign</p>
                                <p className="text-lg font-semibold text-slate-800">{taskDetails.campaign}</p>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Available Assets</h3>
                        <div className="space-y-3">
                            {taskDetails.assets.map((asset, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="text-slate-400 mr-3"><File /></span>
                                        <div>
                                            <p className="font-medium text-slate-800">{asset.name}</p>
                                            <p className="text-sm text-slate-500">{asset.size} • Uploaded {asset.uploaded}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-600 hover:text-slate-800">
                                        <span><Download /></span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                                <span className="mr-2"><Scissors /></span>
                                Open Desktop Editor
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="mr-2"><Upload /></span>
                                Submit for Review
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Requirements</h3>
                        <ul className="space-y-3">
                            {taskDetails.requirements.map((req, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-3 mt-1"><CheckCircle /></span>
                                    <span className="text-slate-600">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};

// === ANIMATED STATUS BADGE ===
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


// === MAIN ASSIGNED TASKS PAGE ===
const AssignedTasks = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    // Placeholder data
    const placeholderCampaigns = [
        { id: 'camp-1', name: 'Summer Breeze', status: 'Active', assignedEditor: 'editor-1', reels: [{title: 'Reel 1'}, {title: 'Reel 2'}], description: 'A cool summer campaign.'},
        { id: 'camp-2', name: 'Winter Fest', status: 'In-Progress', assignedEditor: 'editor-1', reels: [], description: 'A festive winter campaign.'},
    ];
    setUserProfile({ uid: 'editor-1', name: 'Demo Editor' });
    setCampaigns(placeholderCampaigns);
    setLoading(false);
  }, []);

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  // Page-level animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  if(isModalOpen) return <TaskDetailsView onBack={handleCloseModal} />;

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="text-4xl">⏳</span>
            <h3 className="text-lg font-semibold mt-4">Loading Campaigns...</h3>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 space-y-8"
        >
          {/* Header */}
          <motion.div variants={cardVariants} className="text-center md:text-left">
            <motion.h2
              whileInView={{ scale: 1, y: 0 }}
              initial={{ scale: 0.95, y: 20 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
            >
              Assigned Campaigns
            </motion.h2>
            <motion.p
              variants={cardVariants}
              className="text-slate-600 text-lg max-w-2xl mx-auto md:mx-0"
            >
              Manage and track all your assigned campaigns with smooth animations and real-time updates.
            </motion.p>
          </motion.div>

          {/* Task Grid */}
          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  variants={cardVariants}
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.h3
                      whileHover={{ scale: 1.05 }}
                      className="text-xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors"
                    >
                      {campaign.name}
                    </motion.h3>
                    <StatusBadge status={campaign.status} />
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">ID</span>
                      <p className="text-slate-700 font-medium">{campaign.id}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Reels</span>
                      <p className="text-slate-700 font-medium">{campaign.reels?.length || 0}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewDetails(campaign)}
                    className="w-full py-3 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-all text-sm font-bold border border-slate-200"
                  >
                    View Tasks
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl">📋</span>
              <h3 className="text-xl font-semibold mt-4 text-slate-600">No campaigns assigned yet</h3>
              <p className="text-slate-500 mt-2">Check back later for new assigned campaigns.</p>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};

export default AssignedTasks;

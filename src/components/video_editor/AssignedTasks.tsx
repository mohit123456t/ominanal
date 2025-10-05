'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';


interface Campaign {
  id: string;
  assignedEditor?: string;
  status: string;
  name: string;
  reels?: any[];
  description?: string;
}

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

// === ANIMATED MODAL ===
const TaskDetailsPage = ({ campaign, isOpen, onClose }: { campaign: Campaign | null, isOpen: boolean, onClose: () => void }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!videoUrl && !uploadedFile) {
      alert('Please provide either a video URL or upload a file');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Video submitted successfully!');
      onClose();
    }, 2000);
  };

  // Modal Animation Variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-50 overflow-y-auto"
        >
          <div className="min-h-screen">
            {/* Header */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200"
            >
              <div className="max-w-4xl mx-auto px-6 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <motion.h1
                      variants={itemVariants}
                      className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                    >
                      {campaign.name}
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-slate-600 mt-2 text-lg">
                      Campaign Details & Tasks
                    </motion.p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 text-3xl font-bold"
                  >
                    &times;
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Content Sections */}
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
              {[{
                title: "Campaign Information",
                content: (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Status:</span>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">ID:</span>
                      <p className="text-slate-800 mt-1 text-xl">{campaign.id}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Reels:</span>
                      <p className="text-slate-800 mt-1 text-xl">{campaign.reels?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Description:</span>
                      <p className="text-slate-800 mt-1 text-lg">{campaign.description}</p>
                    </div>
                  </div>
                )
              },
              {
                title: "Campaign Description",
                content: <p className="text-slate-700 leading-relaxed text-lg">{campaign.description}</p>
              },
              {
                title: "Reels",
                content: campaign.reels?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign.reels.map((reel, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 cursor-pointer"
                      >
                        <div className="w-14 h-14 bg-slate-200 rounded-xl flex items-center justify-center">
                          <span className="text-slate-600 text-2xl">🎥</span>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-slate-800">{reel.title || `Reel ${index + 1}`}</p>
                          <p className="text-sm text-slate-500">Status: {reel.status || 'Pending'}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-500 italic text-lg py-4"
                  >
                    No reels available yet
                  </motion.p>
                )
              },
              ...(campaign.status === 'Active' ? [{
                title: "Upload Completed Video",
                content: (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Video URL (Optional)</label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Or Upload Video File</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="px-5 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl hover:from-slate-200 hover:to-slate-300 cursor-pointer transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                          <Upload /> Choose File
                        </label>
                        {uploadedFile && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full"
                          >
                            {uploadedFile.name}
                          </motion.span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!videoUrl && !uploadedFile)}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed transition-all text-lg font-bold w-full"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Video'}
                      </motion.button>
                    </div>
                  </div>
                )
              }] : []),
              {
                title: "",
                content: (
                  <div className="flex justify-center pt-4">
                    <motion.button
                      whileHover={{ x: -8 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-8 py-4 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 rounded-xl hover:shadow-md transition-all text-lg font-bold flex items-center gap-2"
                    >
                      ← Back to Campaigns
                    </motion.button>
                  </div>
                )
              }].map((section, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8 hover:shadow-xl transition-shadow"
                >
                  {section.title && (
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="w-2 h-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full mr-3"></span>
                      {section.title}
                    </h3>
                  )}
                  {section.content}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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

  return (
    <>
      <TaskDetailsPage
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

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

'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, AlertTriangle } from 'lucide-react';

// Types
interface Task {
    id: string;
    campaign: string;
    brand: string;
    status: 'In-Progress' | 'Pending Footage' | 'Submitted' | 'New';
    participants: string[];
}

interface Message {
    id: number;
    sender: string;
    message: string;
    timestamp: string;
    type: 'brand' | 'writer' | 'editor' | 'admin';
    media?: { name: string; type: string; size: number }[];
    isReport?: boolean;
}

// Modals
const ShareMediaModal = ({ isOpen, onClose, onShare }: { isOpen: boolean, onClose: () => void, onShare: (files: File[], caption: string) => void }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [caption, setCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
    };

    const handleShare = () => {
        if (selectedFiles.length > 0) {
            onShare(selectedFiles, caption);
            setSelectedFiles([]);
            setCaption('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Share Media</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Photos/Videos</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {selectedFiles.length > 0 && (
                        <div className="text-sm text-slate-600">{selectedFiles.length} file(s) selected</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Caption (Optional)</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Add a caption..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
                    <button
                        onClick={handleShare}
                        disabled={selectedFiles.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void }) => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

    const handleSubmit = () => {
        if (subject.trim() && description.trim()) {
            onSubmit({ subject, description, priority });
            setSubject('');
            setDescription('');
            setPriority('medium');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Report Issue</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief description of the issue"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed description of the issue..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!subject.trim() || !description.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const CollaborationView = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md mx-4">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Collaboration Hub</h3>
                <p className="text-slate-600">This feature is coming soon! You will be able to chat with team members, share files, and report issues directly from here.</p>
            </div>
        </div>
    );
};

export default CollaborationView;

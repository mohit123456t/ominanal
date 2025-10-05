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
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);

    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        // Using placeholder data as we are not connected to DB
        setUserProfile({ name: 'Demo Script Writer', email: 'writer@example.com' });
        const placeholderTasks: Task[] = [
            { id: 'VID001', campaign: 'Summer Sale', brand: 'FashionCo', status: 'In-Progress', participants: ['Editor', 'Writer', 'Brand'] },
            { id: 'VID002', campaign: 'Product Launch', brand: 'TechGadgets', status: 'Submitted', participants: ['Editor', 'Admin'] }
        ];
        setTasks(placeholderTasks);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startNewChat = () => {
        const newId = `V${(parseInt(tasks[0]?.id.slice(1) || '0') + 1).toString().padStart(3, '0')}`;
        const newTask: Task = {
            id: newId,
            campaign: 'Untitled Campaign',
            brand: 'New Client',
            status: 'New',
            participants: ['Video Editor', 'Script Writer', 'Brand Manager'],
        };
        setTasks(prev => [newTask, ...prev]);
        setSelectedTask(newTask);
        setMessages([
            {
                id: Date.now(),
                sender: 'System',
                message: `👋 Welcome to your new chat!\nParticipants: Video Editor, Script Writer, Brand Manager\nStart collaborating!`,
                timestamp: new Date().toLocaleString(),
                type: 'admin',
            },
        ]);
    };

    const handleSendMessage = () => {
        if (!message.trim() || !selectedTask) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: 'Script Writer',
            message: message,
            timestamp: new Date().toLocaleString(),
            type: 'writer',
        };

        setMessages([...messages, newMessage]);
        setMessage('');
    };

    const handleShareMedia = (files: File[], caption: string) => {
        const newMessage: Message = {
            id: Date.now(),
            sender: 'Script Writer',
            message: caption || 'Shared media files',
            timestamp: new Date().toLocaleString(),
            type: 'writer',
            media: files.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
            })),
        };
        setMessages([...messages, newMessage]);
    };

    const handleSubmitReport = (reportData: { subject: string; description: string; priority: string }) => {
        const newMessage: Message = {
            id: Date.now(),
            sender: 'Script Writer',
            message: `📋 Report Submitted: ${reportData.subject}\nPriority: ${reportData.priority}\n${reportData.description}`,
            timestamp: new Date().toLocaleString(),
            type: 'writer',
            isReport: true,
        };
        setMessages([...messages, newMessage]);
    };

    const getMessageStyle = (type: string) => {
        switch (type) {
            case 'brand': return 'bg-blue-50 border-blue-200';
            case 'writer': return 'bg-green-50 border-green-200';
            case 'editor': return 'bg-purple-50 border-purple-200';
            case 'admin': return 'bg-amber-50 border-amber-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    const getSenderIcon = (type: string) => {
        switch (type) {
            case 'brand': return '🏢';
            case 'writer': return '✍️';
            case 'editor': return '🎬';
            case 'admin': return '⚙️';
            default: return '👤';
        }
    };

    return (
        <div className="h-full flex bg-slate-50">
            {/* Tasks Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Communication</h2>
                    <p className="text-sm text-slate-600">Manage your project chats</p>
                </div>

                <div className="px-4 py-3 border-b border-slate-200">
                    <button
                        onClick={startNewChat}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                        <span>➕</span>
                        <span>Start New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                                selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-slate-900">{task.id}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    task.status === 'In-Progress' ? 'bg-blue-100 text-blue-800' :
                                    task.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                                    task.status === 'New' ? 'bg-green-100 text-green-800' :
                                    'bg-slate-100 text-slate-800'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">{task.campaign}</p>
                            <p className="text-xs text-slate-500">{task.brand}</p>
                            <div className="flex items-center mt-2">
                                <span className="text-xs text-slate-500 mr-2">Participants:</span>
                                <div className="flex -space-x-1">
                                    {task.participants.slice(0, 3).map((participant, index) => (
                                        <div
                                            key={`${participant}-${index}`}
                                            className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs border border-white"
                                            title={participant}
                                        >
                                            {participant.charAt(0)}
                                        </div>
                                    ))}
                                    {task.participants.length > 3 && (
                                        <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-xs border border-white">
                                            +{task.participants.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedTask ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {selectedTask.id} — {selectedTask.campaign}
                                    </h3>
                                    <p className="text-sm text-slate-600">{selectedTask.brand}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {selectedTask.participants.map(participant => (
                                        <div key={participant} className="flex items-center space-x-1 text-sm text-slate-600">
                                            <span>{getSenderIcon(
                                                participant === 'Brand Manager' ? 'brand' :
                                                participant === 'Script Writer' ? 'writer' :
                                                participant === 'Video Editor' ? 'editor' : 'admin'
                                            )}</span>
                                            <span>{participant}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.type === 'writer' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg border ${getMessageStyle(msg.type)} shadow-sm`}>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-medium">{getSenderIcon(msg.type)} {msg.sender}</span>
                                            <span className="text-xs text-slate-500">{msg.timestamp}</span>
                                        </div>
                                        <div className="text-sm text-slate-800">
                                            {msg.isReport ? (
                                                <div className="bg-red-50 border border-red-200 rounded p-2">
                                                    <p className="whitespace-pre-line">{msg.message}</p>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-line">{msg.message}</p>
                                            )}
                                            {msg.media && msg.media.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-slate-600 font-medium">📎 Attachments:</p>
                                                    {msg.media.map((file, index) => (
                                                        <div key={`${file.name}-${index}`} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                            {file.type.startsWith('image/') ? '🖼️' : '🎥'} {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-slate-200 p-4">
                            <div className="space-y-3">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Paperclip /> <span>Share Media</span>
                                    </button>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center space-x-1"
                                    >
                                        <AlertTriangle /> <span>Report Issue</span>
                                    </button>
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md mx-4">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Welcome to Collaboration Hub</h3>
                            <p className="text-slate-600 mb-6">Select a task or click “Start New Chat” to begin communicating with your team.</p>
                            <button
                                onClick={startNewChat}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center space-x-2 mx-auto transition-colors"
                            >
                                <span>🚀</span>
                                <span>Start New Chat Now</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ShareMediaModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={handleShareMedia}
            />
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleSubmitReport}
            />
        </div>
    );
};

export default CollaborationView;
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, User } from 'lucide-react';
import { type Lead } from '@/ai/flows/ai-lead-generation';

const AICallView = ({ lead, onClose }: { lead: Lead, onClose: () => void }) => {
    const [status, setStatus] = useState('Connecting...');
    const [transcript, setTranscript] = useState<{ speaker: 'AI' | 'Lead', text: string }[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const callScript = [
        { delay: 2000, action: () => setStatus('Ringing...') },
        { delay: 5000, action: () => setStatus('Connected') },
        { delay: 6000, action: () => setTranscript(prev => [...prev, { speaker: 'AI', text: `Hello, is this ${lead.name}?` }]) },
        { delay: 8000, action: () => setTranscript(prev => [...prev, { speaker: 'Lead', text: 'Yes, this is.' }]) },
        { delay: 10000, action: () => setTranscript(prev => [...prev, { speaker: 'AI', text: `Hi ${lead.name}, my name is Alex. I'm an AI assistant from OmniPost AI.` }]) },
        { delay: 13000, action: () => setTranscript(prev => [...prev, { speaker: 'AI', text: `I noticed your brand, ${lead.name}, and I'm impressed with your work. We help brands supercharge their social media.` }]) },
        { delay: 17000, action: () => setTranscript(prev => [...prev, { speaker: 'Lead', text: 'Oh, interesting. How does it work?' }]) },
        { delay: 20000, action: () => setTranscript(prev => [...prev, { speaker: 'AI', text: 'We use AI to handle everything from content creation to scheduling. Would you be open to a brief 5-minute chat next week to explore this further?' }]) },
        { delay: 24000, action: () => setTranscript(prev => [...prev, { speaker: 'Lead', text: 'Sure, that sounds good.' }]) },
        { delay: 26000, action: () => setStatus('Call Ended') },
        { delay: 27000, action: onClose },
    ];

    useEffect(() => {
        const timeouts = callScript.map(item => setTimeout(item.action, item.delay));
        return () => {
            timeouts.forEach(clearTimeout);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const getStatusColor = () => {
        switch(status) {
            case 'Connecting...':
            case 'Ringing...':
                return 'text-yellow-500';
            case 'Connected':
                return 'text-green-500';
            case 'Call Ended':
                return 'text-red-500';
            default:
                return 'text-slate-400';
        }
    }

    return (
        <motion.div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-300/50"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
            >
                <div className="p-6 text-center border-b border-slate-300/50">
                    <h2 className="text-xl font-bold text-slate-900">{lead.name}</h2>
                    <p className="text-slate-600 font-mono">{lead.mobileNumber}</p>
                    <p className={`mt-2 font-semibold text-lg ${getStatusColor()}`}>{status}</p>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto h-80">
                    {transcript.map((entry, index) => (
                        <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'AI' ? '' : 'flex-row-reverse'}`}>
                            <div className={`p-2 rounded-full ${entry.speaker === 'AI' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {entry.speaker === 'AI' ? <Mic size={16}/> : <User size={16}/>}
                            </div>
                            <div className={`p-3 rounded-lg max-w-xs ${entry.speaker === 'AI' ? 'bg-indigo-50 text-slate-800' : 'bg-slate-100 text-slate-800'}`}>
                                <p className="text-sm">{entry.text}</p>
                            </div>
                        </div>
                    ))}
                     <div ref={transcriptEndRef} />
                </div>

                <div className="p-6 border-t border-slate-300/50 flex justify-center">
                    <button 
                        onClick={onClose} 
                        className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition"
                    >
                        <PhoneOff size={28}/>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AICallView;

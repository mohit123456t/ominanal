'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

const CommunicationView = ({ userProfile }: { userProfile: any }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Placeholder messages
        setMessages([
            { id: 1, sender: 'Admin', text: 'Please double-check the resolution for the "Summer Sale" reels.', timestamp: '10:30 AM' },
            { id: 2, sender: 'You', text: 'Will do. I will re-upload them shortly.', timestamp: '10:32 AM' },
        ]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;
        const msg = {
            id: messages.length + 1,
            sender: 'You',
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...messages, msg]);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-xl shadow-sm border border-slate-200/80">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-slate-800">Team Communication</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'You' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-slate-50">
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunicationView;

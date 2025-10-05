'use client';
import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const faqs = [
    { q: 'How do I start a new campaign?', a: 'You can start a new campaign by navigating to the "Campaigns" tab and clicking the "New Campaign" button. Follow the on-screen instructions to set up your campaign details.' },
    { q: 'How is the campaign budget calculated?', a: 'The budget is automatically calculated based on the number of reels you require and any applicable volume discounts. You can see a detailed breakdown in the "New Campaign" form.' },
    { q: 'Can I get a refund for a completed campaign?', a: 'Refunds are handled on a case-by-case basis. Please submit a support ticket with your campaign ID and reason for the refund request, and our team will get back to you.' },
    { q: 'Where can I see my transaction history?', a: 'Your complete transaction history is available under the "Billing" tab. It shows all deposits, withdrawals, and campaign payments.' },
];

const FAQItem = ({ faq }: { faq: { q: string, a: string } }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-300/70">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-2"
            >
                <span className="font-semibold text-slate-800">{faq.q}</span>
                {isOpen ? <ChevronUp className="text-slate-600" /> : <ChevronDown className="text-slate-600" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 px-2 text-slate-600 text-sm">{faq.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const SupportView = ({ user, campaigns }: { user: any; campaigns: any[] }) => {
     const [formData, setFormData] = useState({ subject: '', message: '', campaignId: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a placeholder, no actual DB interaction
        alert('Support ticket submitted! (This is a demo)');
        setFormData({ subject: '', message: '', campaignId: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    return (
        <div className="animate-fade-in max-w-5xl mx-auto space-y-12">
            <div className="text-center">
                <LifeBuoy className="mx-auto h-12 w-12 text-blue-600" />
                <h1 className="text-4xl font-bold text-slate-900 mt-4">Support Center</h1>
                <p className="text-lg text-slate-600 mt-2">We're here to help. Find answers or get in touch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* FAQs Section */}
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300/70 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} faq={faq} />
                        ))}
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300/70 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
                        <MessageSquare className="mr-3 text-blue-600" />
                        Submit a Support Ticket
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">Our team will get back to you within 24 hours.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                         <div>
                            <label htmlFor="campaignId" className="block text-sm font-medium text-slate-700 mb-1">Related Campaign (Optional)</label>
                            <select id="campaignId" name="campaignId" value={formData.campaignId} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select a campaign</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">How can we help?</label>
                            <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full px-4 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div className="text-right">
                             <button type="submit" className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportView;

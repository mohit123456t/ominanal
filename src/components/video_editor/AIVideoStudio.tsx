'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LoaderCircle, Sparkles, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVideoPrompt } from '@/ai/flows/ai-video-generation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';


const AIVideoStudio = () => {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePrompt = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a prompt to generate a video prompt.' });
            return;
        }
        setIsGenerating(true);
        setGeneratedPrompt('');
        try {
            const result = await generateVideoPrompt({ prompt });
            if (result.generatedPrompt) {
                setGeneratedPrompt(result.generatedPrompt);
                toast({ title: 'AI Video Prompt Generated!', description: 'A new detailed prompt has been created.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message || 'Failed to generate AI video prompt.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        toast({ title: 'Copied to Clipboard!', description: 'You can now paste this prompt into any video generator.' });
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">AI Video Prompt Generator</h1>
                <p className="text-slate-600 mt-2">Generate cinematic prompts from your ideas. Use these prompts in any AI video generator.</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <label htmlFor="topic-input" className="font-semibold text-slate-700">Your Video Idea</label>
                        <Textarea
                            id="topic-input"
                            placeholder="e.g., 'A cat learning to play the piano' or 'A futuristic city at night'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="mt-1 min-h-[100px]"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleGeneratePrompt} disabled={isGenerating || !prompt}>
                            {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                            {isGenerating ? 'Generating Prompt...' : 'Generate Prompt'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            {(isGenerating || generatedPrompt) && (
                 <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Generated Video Prompt:</h3>
                        {isGenerating && !generatedPrompt && (
                             <div className="text-center text-slate-600 p-4">
                                <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2"/>
                                <p>AI is crafting your cinematic prompt...</p>
                            </div>
                        )}
                        {generatedPrompt && (
                            <div className="relative">
                                <Textarea
                                    value={generatedPrompt}
                                    readOnly
                                    className="min-h-[150px] bg-slate-50 text-sm"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopyToClipboard}
                                    className="absolute top-2 right-2"
                                >
                                    <Clipboard className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default AIVideoStudio;

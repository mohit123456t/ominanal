'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LoaderCircle, Sparkles, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateThumbnailPrompts } from '@/ai/flows/ai-thumbnail-generation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '../ui/label';

const AIThumbnailStudio = () => {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [thumbnailPrompts, setThumbnailPrompts] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePrompts = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a video title or topic.' });
            return;
        }
        setIsGenerating(true);
        setThumbnailPrompts([]);
        try {
            const result = await generateThumbnailPrompts({ prompt });
            if (result.prompts) {
                setThumbnailPrompts(result.prompts);
                toast({ title: 'AI Thumbnail Prompts Generated!', description: 'Review the creative prompts below.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message || 'Failed to generate thumbnail prompts.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to Clipboard!', description: 'You can now paste this prompt into any image generator.' });
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">AI Thumbnail Prompt Studio</h1>
                <p className="text-slate-600 mt-2">Generate creative prompts for your thumbnails. Use these in tools like Midjourney or DALL-E.</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="prompt-input" className="font-semibold text-slate-700">Video Title or Topic</Label>
                        <Textarea
                            id="prompt-input"
                            placeholder="e.g., 'My Trip to Japan' or 'How to Cook the Perfect Steak'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="mt-1 min-h-[80px]"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleGeneratePrompts} disabled={isGenerating || !prompt}>
                            {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                            {isGenerating ? 'Generating...' : 'Generate Prompts'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {(isGenerating || thumbnailPrompts.length > 0) && (
                 <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Generated Thumbnail Prompts:</h3>
                        {isGenerating && thumbnailPrompts.length === 0 && (
                             <div className="text-center text-slate-600">
                                <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2"/>
                                <p>AI is creating thumbnail concepts for you...</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            {thumbnailPrompts.map((p, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border rounded-lg p-4 group relative bg-slate-50"
                                >
                                    <p className="text-sm text-slate-700 pr-8">{p}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCopyToClipboard(p)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Clipboard className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default AIThumbnailStudio;

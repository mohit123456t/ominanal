'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LoaderCircle, Sparkles, Clipboard, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateThumbnailPrompts, type GenerateThumbnailPromptsOutput } from '@/ai/flows/ai-thumbnail-generation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '../ui/label';

type ThumbnailIdea = GenerateThumbnailPromptsOutput['ideas'][0];

const AIThumbnailStudio = () => {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [thumbnailIdeas, setThumbnailIdeas] = useState<ThumbnailIdea[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePrompts = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a video title or topic.' });
            return;
        }
        setIsGenerating(true);
        setThumbnailIdeas([]);
        try {
            const result = await generateThumbnailPrompts({ prompt });
            if (result.ideas) {
                setThumbnailIdeas(result.ideas);
                toast({ title: 'AI Thumbnail Concepts Generated!', description: 'Review the creative concepts below.' });
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

    const handleGenerateImage = (idea: ThumbnailIdea) => {
        toast({
            title: "Coming Soon!",
            description: "Direct image generation will be available in a future update."
        })
    }

    return (
        <motion.div
            className="max-w-6xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">AI Thumbnail Concept Studio</h1>
                <p className="text-slate-600 mt-2">Generate creative concepts and prompts for your thumbnails. Use these in tools like Midjourney or DALL-E.</p>
            </div>

            <Card className="bg-white/40 backdrop-blur-xl border-slate-300/70 shadow-lg">
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
                            {isGenerating ? 'Generating...' : 'Generate Concepts'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {(isGenerating || thumbnailIdeas.length > 0) && (
                 <div className="space-y-6">
                    <h3 className="font-bold text-xl text-slate-800 text-center">Generated Thumbnail Concepts:</h3>
                    
                    {isGenerating && thumbnailIdeas.length === 0 && (
                         <div className="text-center text-slate-600 p-8 bg-white/40 rounded-xl">
                            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2"/>
                            <p>AI is creating thumbnail concepts for you...</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {thumbnailIdeas.map((idea, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, scale: 0.95, y:20 }}
                                animate={{ opacity: 1, scale: 1, y:0 }}
                                transition={{ delay: index * 0.15 }}
                                className="group relative bg-white/40 backdrop-blur-xl border border-slate-300/70 rounded-2xl shadow-lg flex flex-col overflow-hidden"
                            >
                                <div className="relative w-full aspect-video bg-slate-200 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-slate-400"/>
                                    <img src={`https://picsum.photos/seed/${index+1}/600/400`} alt={idea.description} className="absolute inset-0 w-full h-full object-cover"/>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold p-2 bg-black/40 rounded-md">
                                        {idea.description}
                                    </p>
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <p className="text-xs text-slate-600 flex-grow">{idea.prompt}</p>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopyToClipboard(idea.prompt)}
                                            className="flex-1"
                                        >
                                            <Clipboard className="h-4 w-4 mr-2" />
                                            Copy
                                        </Button>
                                         <Button
                                            size="sm"
                                            onClick={() => handleGenerateImage(idea)}
                                            className="flex-1"
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AIThumbnailStudio;

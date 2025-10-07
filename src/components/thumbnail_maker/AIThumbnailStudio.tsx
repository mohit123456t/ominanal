'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LoaderCircle, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateThumbnailIdeas } from '@/ai/flows/ai-thumbnail-generation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AIThumbnailStudio = () => {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [thumbnailIdeas, setThumbnailIdeas] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateThumbnails = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a video title or topic.' });
            return;
        }
        setIsGenerating(true);
        setThumbnailIdeas([]);
        try {
            const result = await generateThumbnailIdeas({ prompt });
            if (result.ideas) {
                setThumbnailIdeas(result.ideas);
                toast({ title: 'AI Thumbnail Ideas Generated!', description: 'Review the concepts below.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message || 'Failed to generate thumbnail ideas.' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">AI Thumbnail Studio</h1>
                <p className="text-slate-600 mt-2">Generate thumbnail ideas for any topic, anytime. Perfect for inspiration and quick creation.</p>
            </div>

            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 !text-red-700" />
              <AlertTitle className="text-red-800 font-semibold">Important: Billing Required for This Feature</AlertTitle>
              <AlertDescription className="text-red-700">
                AI image generation uses advanced Google models that require billing to be enabled on your Google Cloud project, even if you are within the free tier. Please enable billing in the <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google Cloud Console</a> to use this feature.
              </AlertDescription>
            </Alert>

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
                        <Button onClick={handleGenerateThumbnails} disabled={isGenerating || !prompt}>
                            {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                            {isGenerating ? 'Generating...' : 'Generate Ideas'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isGenerating && thumbnailIdeas.length === 0 && (
                <Card>
                    <CardContent className="p-6 text-center text-slate-600">
                        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2"/>
                        <p>AI is creating thumbnail concepts for you...</p>
                    </CardContent>
                </Card>
            )}

            {thumbnailIdeas.length > 0 && (
                 <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Generated Thumbnail Ideas:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {thumbnailIdeas.map((idea, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border rounded-lg overflow-hidden group"
                                >
                                    <img src={idea.url} alt={`Thumbnail idea ${index + 1}`} className="w-full h-auto aspect-video object-cover"/>
                                    <p className="text-xs text-center p-2 bg-slate-50 text-slate-600 truncate group-hover:whitespace-normal">{idea.prompt}</p>
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

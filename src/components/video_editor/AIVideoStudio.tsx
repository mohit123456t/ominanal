'use client';
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LoaderCircle, Sparkles, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVideo } from '@/ai/flows/ai-video-generation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AIVideoStudio = () => {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateVideo = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a prompt to generate a video.' });
            return;
        }
        setIsGenerating(true);
        setGeneratedVideoUrl('');
        try {
            const result = await generateVideo({ prompt });
            if (result.videoUrl) {
                setGeneratedVideoUrl(result.videoUrl);
                toast({ title: 'AI Video Generated!', description: 'A new video has been created from your prompt.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message || 'Failed to generate AI video.' });
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
                <h1 className="text-3xl font-bold text-slate-800 mt-4">AI Video Studio</h1>
                <p className="text-slate-600 mt-2">Generate videos from text prompts, anytime. Perfect for brainstorming and creating quick content.</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <label htmlFor="topic-input" className="font-semibold text-slate-700">Video Prompt</label>
                        <Textarea
                            id="topic-input"
                            placeholder="e.g., 'A cinematic shot of a an old car driving down a deserted road at sunset.'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="mt-1 min-h-[100px]"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleGenerateVideo} disabled={isGenerating || !prompt}>
                            {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                            {isGenerating ? 'Generating Video...' : 'Generate Video'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isGenerating && !generatedVideoUrl && (
                 <Card>
                    <CardContent className="p-6 text-center text-slate-600">
                        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2"/>
                        <p>AI is creating your video. This may take up to a minute...</p>
                    </CardContent>
                </Card>
            )}

            {generatedVideoUrl && (
                 <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Generated Video:</h3>
                        <video src={generatedVideoUrl} controls className="w-full rounded-lg border border-slate-200" />
                        <a href={generatedVideoUrl} download="ai-generated-video.mp4" className="mt-2 inline-flex items-center text-sm text-green-700 hover:underline">
                            <Download className="mr-1 h-4 w-4"/> Download Video
                        </a>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default AIVideoStudio;

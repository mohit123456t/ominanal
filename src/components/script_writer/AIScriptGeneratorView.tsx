'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LoaderCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAiCaption } from '@/ai/flows/ai-caption-generation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const AIScriptGeneratorView = () => {
    const { toast } = useToast();
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Casual');
    const [generatedScript, setGeneratedScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateScript = async () => {
        if (!topic) {
            toast({ variant: 'destructive', title: 'Topic is required', description: 'Please enter a topic to generate a script.' });
            return;
        }
        setIsGenerating(true);
        setGeneratedScript('');
        try {
            const result = await generateAiCaption({
                topic: topic,
                contentType: 'script',
                tone: tone as any,
            });
            if (result.caption) {
                setGeneratedScript(result.caption);
                toast({ title: 'AI Script Generated!', description: 'A new script has been drafted for your topic.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to generate AI script.' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            className="max-w-3xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">Independent AI Script Generator</h1>
                <p className="text-slate-600 mt-2">Generate scripts for any topic, anytime, without needing an assigned task.</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="topic-input" className="font-semibold text-slate-700">Topic or Idea</Label>
                        <Textarea
                            id="topic-input"
                            placeholder="e.g., 'A 30-second promo for a new coffee brand' or 'A funny skit about working from home'"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="mt-1 min-h-[80px]"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                             <Label htmlFor="tone-select" className="font-semibold text-slate-700">Tone</Label>
                             <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="w-[150px] mt-1">
                                    <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Casual">Casual</SelectItem>
                                    <SelectItem value="Professional">Professional</SelectItem>
                                    <SelectItem value="Witty">Witty</SelectItem>
                                    <SelectItem value="Inspirational">Inspirational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGenerateScript} disabled={isGenerating || !topic}>
                            {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                            {isGenerating ? 'Generating...' : 'Generate Script'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {generatedScript && (
                 <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Generated Script:</h3>
                        <Textarea
                            value={generatedScript}
                            readOnly
                            className="min-h-[250px] bg-slate-50 text-sm"
                        />
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default AIScriptGeneratorView;

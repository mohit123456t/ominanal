'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LoaderCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAiScript } from '@/ai/flows/ai-script-generation';
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
            const result = await generateAiScript({
                topic: topic,
                tone: tone as any,
            });
            if (result.script) {
                setGeneratedScript(result.script);
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
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4 tracking-tight">Independent AI Script Generator</h1>
                <p className="text-slate-600 mt-2">Generate scripts for any topic, anytime, without needing an assigned task.</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 space-y-4">
                <div>
                    <Label htmlFor="topic-input" className="font-semibold text-slate-700">Topic or Idea</Label>
                    <Textarea
                        id="topic-input"
                        placeholder="e.g., 'A 30-second promo for a new coffee brand' or 'A funny skit about working from home'"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1 min-h-[80px] bg-white/50 border-slate-300/70"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                         <Label htmlFor="tone-select" className="font-semibold text-slate-700">Tone</Label>
                         <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="w-[150px] mt-1 bg-white/50 border-slate-300/70">
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
                    <Button onClick={handleGenerateScript} disabled={isGenerating || !topic} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                        {isGenerating ? <LoaderCircle className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                        {isGenerating ? 'Generating...' : 'Generate Script'}
                    </Button>
                </div>
            </div>

            {generatedScript && (
                 <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80">
                    <h3 className="font-bold text-lg mb-3 text-slate-800">Generated Script:</h3>
                    <Textarea
                        value={generatedScript}
                        readOnly
                        className="min-h-[250px] bg-white/50 text-sm border-slate-300/70"
                    />
                </div>
            )}
        </motion.div>
    );
};

export default AIScriptGeneratorView;

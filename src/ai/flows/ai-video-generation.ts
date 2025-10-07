'use server';

/**
 * @fileOverview AI Video Prompt Generation Flow
 * This file contains a Genkit flow for generating a detailed video prompt from a user's idea.
 * - generateVideoPrompt - Generates a rich prompt for video creation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';


const GenerateVideoPromptInputSchema = z.object({
    prompt: z.string().describe('The user\'s idea or topic for a video ad.'),
});
export type GenerateVideoPromptInput = z.infer<typeof GenerateVideoPromptInputSchema>;

const GenerateVideoPromptOutputSchema = z.object({
    generatedPrompt: z.string().describe('A detailed, descriptive prompt suitable for an AI video generation model, optimized for an advertisement.'),
});
export type GenerateVideoPromptOutput = z.infer<typeof GenerateVideoPromptOutputSchema>;


const generateVideoPromptFlow = ai.defineFlow({
    name: 'generateVideoPromptFlow',
    inputSchema: GenerateVideoPromptInputSchema,
    outputSchema: GenerateVideoPromptOutputSchema,
}, async ({ prompt }) => {

    const { text } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: `You are a creative director specializing in high-impact video advertisements. Your task is to take a user's simple idea and expand it into a rich, detailed, and cinematic prompt for an AI video generation model like Veo or Sora. The goal is to create a compelling ad.
        
        User Idea: "${prompt}"

        Elaborate on this idea with an advertising mindset. Describe the scene, the lighting (e.g., "golden hour," "dramatic studio lighting"), the mood ("uplifting," "mysterious"), camera angles ("dynamic low-angle shot," "slow-motion close-up"), and the action in a way that highlights a product or service.
        Your output must be a single, ready-to-use prompt that would result in a professional-looking video advertisement.
        
        Example:
        User Idea: "a new brand of coffee"
        Your output: "Cinematic 4K product shot of a steaming cup of artisan coffee on a rustic wooden table, morning sunlight filtering through a window, highlighting the rich crema. A slow-motion shot of a single coffee bean dropping into a grinder. The final shot shows a person smiling with satisfaction after their first sip, feeling energized and ready for the day. Uplifting and warm mood."`,
    });

    if (!text) {
        throw new Error('Failed to generate a video prompt.');
    }
    
    return {
        generatedPrompt: text
    };
});


export async function generateVideoPrompt(input: GenerateVideoPromptInput): Promise<GenerateVideoPromptOutput> {
    return generateVideoPromptFlow(input);
}

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
    prompt: z.string().describe('The user\'s idea or topic for a video.'),
});
export type GenerateVideoPromptInput = z.infer<typeof GenerateVideoPromptInputSchema>;

const GenerateVideoPromptOutputSchema = z.object({
    generatedPrompt: z.string().describe('A detailed, descriptive prompt suitable for an AI video generation model.'),
});
export type GenerateVideoPromptOutput = z.infer<typeof GenerateVideoPromptOutputSchema>;


const generateVideoPromptFlow = ai.defineFlow({
    name: 'generateVideoPromptFlow',
    inputSchema: GenerateVideoPromptInputSchema,
    outputSchema: GenerateVideoPromptOutputSchema,
}, async ({ prompt }) => {

    const { text } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: `You are a creative assistant that expands a user's simple idea into a rich, detailed prompt for an AI video generator.
        
        User Idea: "${prompt}"

        Take this idea and elaborate on it. Describe the scene, the lighting, the mood, the camera angles, and the action in a cinematic way.
        Your output should be a single, ready-to-use prompt for a model like Veo or Sora.
        
        Example:
        User Idea: "a cat in space"
        Your output: "Cinematic 4K shot of a fluffy ginger cat wearing a tiny astronaut helmet, floating serenely inside a spaceship cockpit, with the Earth visible through the window, soft nebula light illuminating its fur."`,
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

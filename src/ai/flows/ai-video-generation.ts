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
    prompt: z.string().describe('The user\'s idea or topic for a video ad, which can be in English or Hinglish.'),
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
        
        The user's idea may be in English or Hinglish (a mix of Hindi and English). You must understand both and translate the core concept into a professional English prompt.

        User Idea: "${prompt}"

        Elaborate on this idea with an advertising mindset. Describe the scene, the lighting (e.g., "golden hour," "dramatic studio lighting"), the mood ("uplifting," "mysterious"), camera angles ("dynamic low-angle shot," "slow-motion close-up"), and the action in a way that highlights a product or service. Your final output must be a single, ready-to-use prompt in English.
        
        Example:
        User Idea: "Diwali par hamare naye chocolate protein supplement par 10% discount"
        Your output: "Hyper-realistic 8K product shot of a sleek, chocolate protein supplement tub decorated with glowing marigold flowers and festive diyas for a Diwali celebration. A bold, elegant text overlay announces 'DIWALI SALE: 10% OFF'. The atmosphere is warm, celebratory, and premium, with a shallow depth of field focusing on the product."`,
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

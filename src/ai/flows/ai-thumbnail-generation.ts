'use server';
/**
 * @fileOverview AI Thumbnail Prompt Generation Flow
 * This file contains a Genkit flow for generating thumbnail prompts for a video.
 * It now uses a two-step process:
 * 1. Improve the user's initial prompt into a rich, detailed prompt.
 * 2. Use that improved prompt to generate several distinct visual concepts.
 *
 * - improvePrompt - Step 1: Takes a basic user idea and expands it.
 * - generateThumbnailPrompts - Step 2: Takes the improved prompt and generates concepts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

// =========== STEP 1: Improve User's Prompt ===========

const ImprovePromptInputSchema = z.object({
  prompt: z.string().describe("The user's initial, simple idea or topic for a video ad, which can be in English or Hinglish."),
});
export type ImprovePromptInput = z.infer<typeof ImprovePromptInputSchema>;

const ImprovePromptOutputSchema = z.object({
    improvedPrompt: z.string().describe('A detailed, descriptive, and cinematic prompt suitable for an AI image or video generator, optimized for an advertisement.'),
});
export type ImprovePromptOutput = z.infer<typeof ImprovePromptOutputSchema>;


const improvePromptFlow = ai.defineFlow({
    name: 'improvePromptFlow',
    inputSchema: ImprovePromptInputSchema,
    outputSchema: ImprovePromptOutputSchema,
}, async ({ prompt }) => {

    const { text } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: `You are a world-class creative director specializing in high-impact video advertisements. 
        Your task is to take a user's simple idea and expand it into a single, rich, detailed, and cinematic prompt for an AI image/video generator like Midjourney, DALL-E, or Veo. The goal is to create a compelling ad concept.
        
        The user's idea may be in English or Hinglish (a mix of Hindi and English). You must understand both and translate the core concept into a professional English prompt.

        User's Idea: "${prompt}"

        Elaborate on this idea with an advertising mindset. Describe the scene, the lighting (e.g., "golden hour," "dramatic studio lighting"), the mood ("uplifting," "mysterious"), camera angles ("dynamic low-angle shot," "slow-motion close-up"), and the action in a way that highlights a product or service.
        Your output must be a single, cohesive, ready-to-use prompt in English that would result in a professional-looking advertisement still.
        
        Example 1:
        User's Idea: "a new brand of coffee"
        Your output: "Cinematic 4K product shot of a steaming cup of artisan coffee on a rustic wooden table, morning sunlight filtering through a window, highlighting the rich crema. A slow-motion shot of a single coffee bean dropping into a grinder. The final shot shows a person smiling with satisfaction after their first sip, feeling energized and ready for the day. Uplifting and warm mood."

        Example 2:
        User's Idea: "Diwali 10% discount on our chocolate protein supplement"
        Your output: "Hyper-realistic 8K product shot of a sleek, chocolate protein supplement tub decorated with glowing marigold flowers and festive diyas for a Diwali celebration. A bold, elegant text overlay announces 'DIWALI SALE: 10% OFF'. The atmosphere is warm, celebratory, and premium, with a shallow depth of field focusing on the product."
        `,
    });

    if (!text) {
        throw new Error('Failed to improve the video prompt.');
    }
    
    return {
        improvedPrompt: text
    };
});

export async function improvePrompt(input: ImprovePromptInput): Promise<ImprovePromptOutput> {
    return improvePromptFlow(input);
}


// =========== STEP 2: Generate Thumbnail Concepts from Improved Prompt ===========

const GenerateThumbnailPromptsInputSchema = z.object({
  prompt: z.string().describe('The improved, detailed, and cinematic prompt to generate thumbnail concepts from.'),
});
export type GenerateThumbnailPromptsInput = z.infer<typeof GenerateThumbnailPromptsInputSchema>;


const ThumbnailIdeaSchema = z.object({
    prompt: z.string().describe("A creative and visually descriptive prompt for a high-CTR ad thumbnail, optimized for an AI image generator like Midjourney or DALL-E. This should be a variation or a specific scene from the main improved prompt."),
    description: z.string().describe("A one-sentence description of the visual scene this prompt would create. For example: 'A close-up of a gamer's excited face lit by a neon laptop screen'.")
});

const GenerateThumbnailPromptsOutputSchema = z.object({
  ideas: z.array(ThumbnailIdeaSchema).describe("An array of 3 creative and visually descriptive concepts for a high-CTR ad thumbnail, based on the provided detailed prompt."),
});
export type GenerateThumbnailPromptsOutput = z.infer<typeof GenerateThumbnailPromptsOutputSchema>;


const generateThumbnailPromptsFlow = ai.defineFlow(
  {
    name: 'generateThumbnailPromptsFlow',
    inputSchema: GenerateThumbnailPromptsInputSchema,
    outputSchema: GenerateThumbnailPromptsOutputSchema,
  },
  async ({ prompt }) => {
    
    const thumbnailPromptsGenerator = await ai.generate({
        prompt: `You are a creative director who creates hyper-realistic, high-click-through-rate (CTR) ad thumbnails based on a detailed master prompt.
        Your job is to generate 3 unique, visually compelling thumbnail concepts based *strictly* on the detailed prompt provided below. For each concept, provide a 'prompt' and a simple 'description'.

        **Detailed Master Prompt:**
        "${prompt}"
        
        **CRITICAL INSTRUCTIONS FOR EACH 'prompt':**
        1.  **Strict Relevance:** Each thumbnail prompt MUST be a specific scene or interpretation taken directly from the "Detailed Master Prompt". Do not invent new subjects.
        2.  **Hyper-Realism & Advertising Principles:**
            - USE terms like "cinematic, hyper-realistic, 8K, photorealistic, sharp focus".
            - FOCUS on high emotion, visual clarity with a single subject, bold colors, and dramatic lighting.
            - If the master prompt mentions an offer (e.g., "10% OFF"), ensure it's visually represented.
        3.  **Photography Techniques:** Suggest techniques like "shallow depth of field", "dramatic lighting", "golden hour" if they fit the scene.

        **CRITICAL INSTRUCTIONS FOR EACH 'description':**
            - Provide a simple, one-sentence summary of the visual scene.

        Now, generate 3 distinct thumbnail concepts based on the detailed master prompt.`,
        model: googleAI.model('gemini-2.5-flash'),
        output: {
            schema: GenerateThumbnailPromptsOutputSchema
        }
    });

    const output = thumbnailPromptsGenerator.output;
    if (!output?.ideas || output.ideas.length === 0) {
        throw new Error('Failed to generate creative prompts for thumbnails.');
    }

    return { ideas: output.ideas };
  }
);


export async function generateThumbnailPrompts(input: GenerateThumbnailPromptsInput): Promise<GenerateThumbnailPromptsOutput> {
  return generateThumbnailPromptsFlow(input);
}

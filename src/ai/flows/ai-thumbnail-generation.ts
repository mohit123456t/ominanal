'use server';
/**
 * @fileOverview AI Thumbnail Prompt Generation Flow
 * This file contains a Genkit flow for generating thumbnail prompts for a video.
 * - generateThumbnailPrompts - Generates thumbnail prompt concepts from a text prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateThumbnailPromptsInputSchema = z.object({
  prompt: z.string().describe('The topic or title of the video ad to generate thumbnails for.'),
});
export type GenerateThumbnailPromptsInput = z.infer<typeof GenerateThumbnailPromptsInputSchema>;

const GenerateThumbnailPromptsOutputSchema = z.object({
  prompts: z.array(z.string().describe("A creative and visually descriptive prompt for a high-CTR ad thumbnail.")),
});
export type GenerateThumbnailPromptsOutput = z.infer<typeof GenerateThumbnailPromptsOutputSchema>;


const generateThumbnailPromptsFlow = ai.defineFlow(
  {
    name: 'generateThumbnailPromptsFlow',
    inputSchema: GenerateThumbnailPromptsInputSchema,
    outputSchema: GenerateThumbnailPromptsOutputSchema,
  },
  async ({ prompt }) => {
    
    // This prompt asks the text model to generate creative prompts.
    const thumbnailPromptsGenerator = await ai.generate({
        prompt: `You are a creative director specializing in high-click-through-rate (CTR) ad thumbnails for platforms like YouTube and Instagram.
        Given the video ad title, generate 3 unique, highly detailed, and visually compelling prompts for an AI image generator. The goal is to create a thumbnail that grabs attention and makes people click.

        Video Ad Title: {{{prompt}}}
        
        Think about advertising principles:
        - **High Emotion:** Focus on expressive faces (shock, excitement, satisfaction).
        - **Visual Clarity:** A single, clear subject. Use bold, contrasting colors.
        - **Intrigue & Curiosity:** Create a sense of mystery or a "before and after" effect.
        - **Branding:** Subtly include brand colors or product placement.
        - **Minimal Text:** Suggest short, punchy text overlays like "50% OFF" or "SECRET REVEALED".

        Generate 3 unique prompts optimized for an advertisement.`,
        model: googleAI.model('gemini-2.5-flash'),
        output: {
            schema: z.object({ prompts: z.array(z.string().describe("A creative and visually descriptive prompt for a high-CTR ad thumbnail.")) })
        }
    });

    const output = thumbnailPromptsGenerator.output;
    if (!output?.prompts || output.prompts.length === 0) {
        throw new Error('Failed to generate creative prompts for thumbnails.');
    }

    return { prompts: output.prompts };
  }
);


export async function generateThumbnailPrompts(input: GenerateThumbnailPromptsInput): Promise<GenerateThumbnailPromptsOutput> {
  return generateThumbnailPromptsFlow(input);
}

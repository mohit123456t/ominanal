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
  prompt: z.string().describe('The topic or title of the video to generate thumbnails for.'),
});
export type GenerateThumbnailPromptsInput = z.infer<typeof GenerateThumbnailPromptsInputSchema>;

const GenerateThumbnailPromptsOutputSchema = z.object({
  prompts: z.array(z.string().describe("A creative and visually descriptive prompt for a thumbnail.")),
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
        prompt: `You are a creative director specializing in viral YouTube thumbnails.
        Given the video title, generate 3 unique, highly detailed, and visually compelling prompts to give to an AI image generator.
        Focus on creating a sense of curiosity, emotion, and visual clarity.

        Video Title: {{{prompt}}}
        
        Think about:
        - Bold, contrasting colors.
        - Close-up on expressive faces or key objects.
        - Dynamic action or a sense of mystery.
        - Minimal but impactful text overlays.

        Generate 3 unique prompts.`,
        model: googleAI.model('gemini-2.5-flash'),
        output: {
            schema: z.object({ prompts: z.array(z.string().describe("A creative and visually descriptive prompt for a thumbnail.")) })
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

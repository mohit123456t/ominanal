'use server';
/**
 * @fileOverview AI Thumbnail Idea Generation Flow
 * This file contains a Genkit flow for generating thumbnail ideas for a video.
 * - generateThumbnailIdeas - Generates thumbnail concepts from a text prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateThumbnailInputSchema = z.object({
  prompt: z.string().describe('The topic or title of the video to generate thumbnails for.'),
});
export type GenerateThumbnailInput = z.infer<typeof GenerateThumbnailInputSchema>;

const ThumbnailIdeaSchema = z.object({
    url: z.string().url().describe("The data URI of the generated thumbnail image."),
    prompt: z.string().describe("A short description of the style or concept of the thumbnail."),
});

const GenerateThumbnailOutputSchema = z.object({
  ideas: z.array(ThumbnailIdeaSchema).describe('An array of generated thumbnail ideas.'),
});
export type GenerateThumbnailOutput = z.infer<typeof GenerateThumbnailOutputSchema>;

// This prompt is for a text model to generate creative prompts for an image model.
const thumbnailPromptsGenerator = ai.definePrompt({
    name: 'thumbnailPromptsGenerator',
    input: { schema: GenerateThumbnailInputSchema },
    output: { schema: z.object({ prompts: z.array(z.string().describe("A creative and visually descriptive prompt for a thumbnail.")) }) },
    prompt: `You are a creative director specializing in viral YouTube thumbnails.
    Given the video title, generate 3 distinct, highly detailed, and visually compelling prompts to give to an AI image generator.
    Focus on creating a sense of curiosity, emotion, and visual clarity.

    Video Title: {{{prompt}}}
    
    Think about:
    - Bold, contrasting colors.
    - Close-up on expressive faces or key objects.
    - Dynamic action or a sense of mystery.
    - Minimal but impactful text overlays.

    Generate 3 unique prompts.`,
});


const generateThumbnailIdeasFlow = ai.defineFlow(
  {
    name: 'generateThumbnailIdeasFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async ({ prompt }) => {
    
    // Step 1: Generate creative prompts from the video title.
    const { output } = await thumbnailPromptsGenerator({ prompt });
    if (!output?.prompts || output.prompts.length === 0) {
        throw new Error('Failed to generate creative prompts for thumbnails.');
    }

    // Step 2: Generate an image for each creative prompt in parallel.
    const imageGenerationPromises = output.prompts.map(async (p) => {
        const { media } = await ai.generate({
            model: googleAI.model('imagen-4.0-fast-generate-001'),
            prompt: `${p}, hyper-realistic, 4k, cinematic lighting`,
        });
        return {
            url: media.url,
            prompt: p.length > 50 ? p.substring(0, 50) + '...' : p, // Shorten prompt for display
        };
    });

    const ideas = await Promise.all(imageGenerationPromises);

    return { ideas };
  }
);


export async function generateThumbnailIdeas(input: GenerateThumbnailInput): Promise<GenerateThumbnailOutput> {
  return generateThumbnailIdeasFlow(input);
}

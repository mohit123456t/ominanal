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


const ThumbnailIdeaSchema = z.object({
    prompt: z.string().describe("A creative and visually descriptive prompt for a high-CTR ad thumbnail, optimized for an AI image generator like Midjourney or DALL-E."),
    description: z.string().describe("A one-sentence description of the visual scene this prompt would create. For example: 'A close-up of a gamer's excited face lit by a neon laptop screen'.")
});

const GenerateThumbnailPromptsOutputSchema = z.object({
  ideas: z.array(ThumbnailIdeaSchema).describe("An array of creative and visually descriptive concepts for a high-CTR ad thumbnail."),
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
        prompt: `You are a creative director specializing in hyper-realistic, high-click-through-rate (CTR) ad thumbnails.
        Your MOST IMPORTANT job is to create concepts that are DIRECTLY based on the user's provided "Video Ad Title". Do not invent new subjects.

        Video Ad Title: {{{prompt}}}
        
        Generate 3 unique, highly detailed, and visually compelling concepts based *strictly* on the title above. For each concept, provide a 'prompt' for an AI image generator and a simple one-sentence 'description'.

        **CRITICAL INSTRUCTIONS FOR EACH 'prompt':**
        1.  **Strict Relevance:** The prompt MUST reflect the core subject of the "Video Ad Title". For example, if the title is "Diwali offer on protein powder", your concepts MUST include Diwali themes and protein powder.
        2.  **Hyper-Realism & Advertising Principles:**
            - Include terms like "cinematic, hyper-realistic, 8K, photorealistic, sharp focus".
            - Focus on high emotion, visual clarity with a single subject, bold colors, and dramatic lighting.
            - If the title mentions a discount or offer, visually represent it (e.g., text overlay "10% OFF").
        3.  **Photography Techniques:** Suggest techniques like "shallow depth of field", "dramatic lighting", "golden hour".

        **CRITICAL INSTRUCTIONS FOR EACH 'description':**
            - Provide a simple, one-sentence summary of the visual scene.

        **EXAMPLE 1:**
        Video Ad Title: "My new gaming laptop"
        Your Output (JSON):
        {
          "ideas": [
            {
              "prompt": "Hyper-realistic 8K photo of a gamer's face, illuminated by the neon glow of a high-end gaming laptop. Eyes wide with shock and excitement, dramatic lighting, shallow depth of field focusing on the keyboard.",
              "description": "A close-up of a gamer's excited face lit by a neon laptop screen."
            },
            ...
          ]
        }

        **EXAMPLE 2:**
        Video Ad Title: "Diwali 10% discount on our chocolate protein supplement"
        Your Output (JSON):
        {
          "ideas": [
            {
                "prompt": "Cinematic photo of a sleek, chocolate protein supplement tub decorated with marigold flowers and glowing diyas for Diwali. A bold, elegant text overlay says 'DIWALI SALE 10% OFF'. Hyper-realistic, 8K, festive atmosphere, warm lighting.",
                "description": "A protein supplement tub decorated for Diwali with a '10% OFF' text overlay."
            },
            ...
          ]
        }

        Now, generate the prompts for the given video ad title.`,
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

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
        prompt: `You are a creative director specializing in hyper-realistic, high-click-through-rate (CTR) ad thumbnails for platforms like YouTube and Instagram.
        Given the video ad title, generate 3 unique, highly detailed, and visually compelling concepts for an AI image generator. For each concept, provide both a detailed 'prompt' for the AI image generator, and a simple one-sentence 'description' of the resulting visual.

        Video Ad Title: {{{prompt}}}
        
        **CRITICAL INSTRUCTIONS FOR EACH 'prompt':**
        1.  **Hyper-Realism:** Each prompt MUST include terms like "cinematic, hyper-realistic, 8K, photorealistic, sharp focus".
        2.  **Advertising Principles:**
            - **High Emotion:** Focus on expressive faces (shock, excitement, satisfaction).
            - **Visual Clarity:** A single, clear subject. Use bold, contrasting colors and dramatic lighting.
            - **Intrigue & Curiosity:** Create a sense of mystery or a "before and after" effect.
            - **Professional Photography:** Suggest techniques like "shallow depth of field", "dramatic lighting", "golden hour".
        3. **CRITICAL INSTRUCTIONS FOR EACH 'description':**
            - Provide a simple, one-sentence summary of the visual scene. This is for internal use.

        **EXAMPLE:**
        Video Ad Title: "My new gaming laptop"
        Your Output (in JSON format):
        {
          "ideas": [
            {
              "prompt": "Hyper-realistic 8K photo of a gamer's face, illuminated by the neon glow of a high-end gaming laptop. Eyes wide with shock and excitement, dramatic lighting, shallow depth of field focusing on the intricate details of the keyboard.",
              "description": "A close-up of a gamer's excited face lit by a neon laptop screen."
            },
            {
              "prompt": "Cinematic close-up shot of a sleek, futuristic gaming laptop on a dark, metallic surface. Steam rises from the vents, glowing with RGB light. The reflection on the screen shows a tense moment from a AAA game. Photorealistic, sharp focus.",
              "description": "A sleek, glowing gaming laptop on a dark surface with steam rising from it."
            },
            {
              "prompt": "A stunning 'before and after' style photo. On the left, a frustrated gamer with an old, slow laptop. On the right, the same gamer, now ecstatic and victorious, with the new, glowing gaming laptop. 8K, hyper-realistic, dramatic contrast.",
              "description": "A split-screen showing a frustrated gamer on one side and an ecstatic gamer with a new laptop on the other."
            }
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

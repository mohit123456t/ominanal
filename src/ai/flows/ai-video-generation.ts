'use server';

/**
 * @fileOverview AI Video Generation Flow
 * This file contains a Genkit flow for generating a video from a text prompt using Veo.
 * - generateVideo - Generates a video from a text prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';


const GenerateVideoInputSchema = z.object({
    prompt: z.string().describe('The text prompt to generate a video from.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
    videoUrl: z.string().url().describe('The data URI of the generated video.'),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;


const generateVideoFlow = ai.defineFlow({
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
}, async ({ prompt }) => {

    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: prompt,
        config: {
            durationSeconds: 5,
            aspectRatio: '16:9',
        },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }
    
    // Wait until the operation completes. This may take some time.
    while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        operation = await ai.checkOperation(operation);
    }
    
    if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video || !video.media?.url) {
        throw new Error('Failed to find the generated video in the operation result.');
    }
    
    // The URL from Veo is temporary. To make it usable on the client, we must fetch it 
    // and convert it to a Base64 data URI.
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
        `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

     if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        throw new Error(`Failed to download generated video. Status: ${videoDownloadResponse.status}`);
    }

    const videoBuffer = await videoDownloadResponse.buffer();
    const videoBase64 = videoBuffer.toString('base64');

    return {
        videoUrl: `data:${video.media.contentType || 'video/mp4'};base64,${videoBase64}`
    };
});


export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
    return generateVideoFlow(input);
}

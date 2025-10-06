'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI captions for social media posts.
 *
 * The flow takes either a topic or media data URI as input and returns an engaging caption.
 * It exports:
 * - `generateAiCaption`: The main function to trigger the caption generation flow.
 * - `AICaptionInput`: The input type for the `generateAiCaption` function.
 * - `AICaptionOutput`: The output type for the `generateAiCaption` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICaptionInputSchema = z.object({
  topic: z.string().optional().describe('A topic to generate a caption about.'),
  mediaDataUri: z
    .string()
    .optional()
    .describe(
      "A media file (image or video) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'" // cspell:disable-line
    ),
  tone: z
    .enum(['Professional', 'Witty', 'Casual', 'Inspirational'])
    .default('Casual')
    .describe('The desired tone of the content.'),
});
export type AICaptionInput = z.infer<typeof AICaptionInputSchema>;

const AICaptionOutputSchema = z.object({
  caption: z.string().describe('The generated caption for the social media post.'),
});
export type AICaptionOutput = z.infer<typeof AICaptionOutputSchema>;

export async function generateAiCaption(input: AICaptionInput): Promise<AICaptionOutput> {
  return aiCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCaptionPrompt',
  input: {schema: AICaptionInputSchema},
  output: {schema: AICaptionOutputSchema},
  prompt: `You are an expert social media copywriter. Your task is to generate a concise and engaging caption for a social media post based on the provided characteristics.

Tone: {{tone}}

{{~#if topic~}}
Topic/Theme: {{topic}}
{{~/if~}}

{{~#if mediaDataUri~}}
Media Analysis: {{media url=mediaDataUri}}
{{~/if~}}

**Instructions for caption generation:**
1. The caption should be short, engaging, and suitable for a social media post.
2. If the topic is provided, create a caption based on that. If media is provided, analyze it to create a relevant caption.
3. Start with a strong hook to grab the viewer's attention.
4. End with a clear call to action (e.g., "Follow for more," "Comment below," "Check the link in bio").
`,
});

const aiCaptionFlow = ai.defineFlow(
  {
    name: 'aiCaptionFlow',
    inputSchema: AICaptionInputSchema,
    outputSchema: AICaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

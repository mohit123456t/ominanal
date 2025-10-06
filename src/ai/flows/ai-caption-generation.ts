'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI captions or scripts for social media posts.
 *
 * The flow takes either a topic or media data URI as input and returns an engaging caption or a full script.
 * It exports:
 * - `generateAiCaption`: The main function to trigger the caption generation flow.
 * - `AICaptionInput`: The input type for the `generateAiCaption` function.
 * - `AICaptionOutput`: The output type for the `generateAiCaption` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICaptionInputSchema = z.object({
  topic: z.string().optional().describe('A topic to generate a caption or script about.'),
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
  contentType: z
    .enum(['caption', 'script'])
    .default('caption')
    .describe('The type of content to generate: a short caption or a longer script.'),
});
export type AICaptionInput = z.infer<typeof AICaptionInputSchema>;

const AICaptionOutputSchema = z.object({
  caption: z.string().describe('The generated caption or script for the social media post.'),
});
export type AICaptionOutput = z.infer<typeof AICaptionOutputSchema>;

export async function generateAiCaption(input: AICaptionInput): Promise<AICaptionOutput> {
  return aiCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCaptionPrompt',
  input: {schema: AICaptionInputSchema},
  output: {schema: AICaptionOutputSchema},
  prompt: `You are an expert social media scriptwriter, specializing in creating viral short-form video content. Your task is to generate a complete and engaging {{contentType}} for a social media post based on the provided characteristics.

Tone: {{tone}}

{{~#if topic~}}
Topic/Theme: {{topic}}
{{~/if~}}

{{~#if mediaDataUri~}}
Media Analysis: {{media url=mediaDataUri}}
{{~/if~}}

**Instructions for script generation:**
1. The script should be concise and suitable for a short video (e.g., 30-60 seconds).
2. Structure the script with clear sections like [SCENE], [VISUAL], [VOICEOVER], or speaker names (e.g., SPEAKER 1).
3. The language should be engaging, direct, and easy to understand.
4. Include suggestions for visuals, on-screen text, and sound effects where appropriate to make the video more dynamic.
5. Start with a strong hook to grab the viewer's attention within the first 3 seconds.
6. End with a clear call to action (e.g., "Follow for more," "Comment below," "Check the link in bio").

If the request is for a 'script', provide a full and ready-to-use script based on the topic. Otherwise, provide a concise and engaging caption.
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

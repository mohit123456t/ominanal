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
      "A media file (image or video) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'." // cspell:disable-line
    ),
  tone: z
    .enum(['Professional', 'Witty', 'Casual'])
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
  prompt: `You are a social media expert. Generate an engaging {{contentType}} for a social media post with the following characteristics:

Tone: {{tone}}

{{~#if topic~}}
Topic: {{topic}}
{{~/if~}}

{{~#if mediaDataUri~}}
Media: {{media url=mediaDataUri}}
{{~/if~}}

{{~#if (eq contentType "script")~}}
Please provide a full script for a short video based on the topic.
{{~else~}}
Please provide a concise and engaging caption.
{{~/if~}}
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

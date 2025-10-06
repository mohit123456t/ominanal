'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI scripts for social media posts.
 *
 * It exports:
 * - `generateAiScript`: The main function to trigger the script generation flow.
 * - `AIScriptInput`: The input type for the `generateAiScript` function.
 * - `AIScriptOutput`: The output type for the `generateAiScript` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIScriptInputSchema = z.object({
  topic: z.string().describe('A topic to generate a script about.'),
  tone: z
    .enum(['Professional', 'Witty', 'Casual', 'Inspirational'])
    .default('Casual')
    .describe('The desired tone of the content.'),
});
export type AIScriptInput = z.infer<typeof AIScriptInputSchema>;

const AIScriptOutputSchema = z.object({
  script: z.string().describe('The generated script for the social media post.'),
});
export type AIScriptOutput = z.infer<typeof AIScriptOutputSchema>;

export async function generateAiScript(input: AIScriptInput): Promise<AIScriptOutput> {
  return aiScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiScriptPrompt',
  input: {schema: AIScriptInputSchema},
  output: {schema: AIScriptOutputSchema},
  prompt: `You are an expert social media scriptwriter, specializing in creating viral short-form video content. Your task is to generate a complete and engaging script for a social media post based on the provided characteristics.

Tone: {{tone}}
Topic/Theme: {{topic}}

**Instructions for script generation:**
1. The script should be concise and suitable for a short video (e.g., 30-60 seconds).
2. Structure the script with clear sections like [SCENE], [VISUAL], [VOICEOVER], or speaker names (e.g., SPEAKER 1).
3. The language should be engaging, direct, and easy to understand.
4. Include suggestions for visuals, on-screen text, and sound effects where appropriate to make the video more dynamic.
5. Start with a strong hook to grab the viewer's attention within the first 3 seconds.
6. End with a clear call to action (e.g., "Follow for more," "Comment below," "Check the link in bio").

Provide a full and ready-to-use script based on the topic.
`,
});

const aiScriptFlow = ai.defineFlow(
  {
    name: 'aiScriptFlow',
    inputSchema: AIScriptInputSchema,
    outputSchema: AIScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

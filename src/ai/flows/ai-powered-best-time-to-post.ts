'use server';
/**
 * @fileOverview An AI-powered best time to post suggestion flow.
 *
 * - suggestBestTimeToPost - A function that suggests the best time to post on social media platforms.
 * - SuggestBestTimeToPostInput - The input type for the suggestBestTimeToPost function.
 * - SuggestBestTimeToPostOutput - The return type for the suggestBestTimeToPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBestTimeToPostInputSchema = z.object({
  platform: z.string().describe('The social media platform (e.g., Instagram, Facebook, X).'),
  audienceActivityData: z
    .string()
    .describe(
      'Data about the user audience activity on the specified platform. Should include follower counts, engagement rates, reach and impressions, and video views and watch time.'
    ),
  postContent: z.string().describe('The content of the post to be made.'),
});
export type SuggestBestTimeToPostInput = z.infer<typeof SuggestBestTimeToPostInputSchema>;

const SuggestBestTimeToPostOutputSchema = z.object({
  suggestedPostTime: z
    .string()
    .describe(
      'The suggested time to post, in ISO 8601 format, to maximize engagement. Timezone is assumed to be UTC.'
    ),
  explanation: z
    .string()
    .describe('Explanation of why this time is optimal based on audience activity data.'),
});
export type SuggestBestTimeToPostOutput = z.infer<typeof SuggestBestTimeToPostOutputSchema>;

export async function suggestBestTimeToPost(
  input: SuggestBestTimeToPostInput
): Promise<SuggestBestTimeToPostOutput> {
  return suggestBestTimeToPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBestTimeToPostPrompt',
  input: {schema: SuggestBestTimeToPostInputSchema},
  output: {schema: SuggestBestTimeToPostOutputSchema},
  prompt: `You are a social media marketing expert. Analyze the provided audience activity data for the given platform and the content of the post, and suggest the optimal time to post it to maximize engagement. Return the suggested time in ISO 8601 format.

Platform: {{{platform}}}
Audience Activity Data: {{{audienceActivityData}}}
Post Content: {{{postContent}}}

Consider factors such as peak activity times, demographics, and the type of content.

Format your response as follows:

Suggested Post Time (UTC): [ISO 8601 timestamp]
Explanation: [Why this time is optimal]`,
});

const suggestBestTimeToPostFlow = ai.defineFlow(
  {
    name: 'suggestBestTimeToPostFlow',
    inputSchema: SuggestBestTimeToPostInputSchema,
    outputSchema: SuggestBestTimeToPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

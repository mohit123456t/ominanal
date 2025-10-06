'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending relevant and trending hashtags
 * optimized for each platform to maximize the reach and engagement of user posts.
 *
 * - `getHashtagRecommendations` - A function that takes post content as input and returns hashtag recommendations.
 * - `HashtagRecommendationsInput` - The input type for the `getHashtagRecommendations` function.
 * - `HashtagRecommendationsOutput` - The return type for the `getHashtagRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HashtagRecommendationsInputSchema = z.object({
  postContent: z.string().describe('The content of the social media post.'),
  platform: z.string().describe('The social media platform (e.g., Instagram, Facebook, X).'),
});
export type HashtagRecommendationsInput = z.infer<typeof HashtagRecommendationsInputSchema>;

const HashtagRecommendationsOutputSchema = z.object({
  hashtags: z.array(z.string()).describe('An array of relevant and trending hashtags for the post and platform.'),
});
export type HashtagRecommendationsOutput = z.infer<typeof HashtagRecommendationsOutputSchema>;

export async function getHashtagRecommendations(input: HashtagRecommendationsInput): Promise<HashtagRecommendationsOutput> {
  return hashtagRecommendationsFlow(input);
}

const hashtagRecommendationsPrompt = ai.definePrompt({
  name: 'hashtagRecommendationsPrompt',
  input: {schema: HashtagRecommendationsInputSchema},
  output: {schema: HashtagRecommendationsOutputSchema},
  prompt: `You are an AI social media expert. Given the content of a social media post and the platform it will be published on, you will provide a list of relevant and trending hashtags to maximize its reach and engagement.

Post Content: {{{postContent}}}
Platform: {{{platform}}}

Please provide 5-10 hashtags that are most relevant to the post content and trending on the specified platform. Do not include the # symbol in your response.
`,
});

const hashtagRecommendationsFlow = ai.defineFlow(
  {
    name: 'hashtagRecommendationsFlow',
    inputSchema: HashtagRecommendationsInputSchema,
    outputSchema: HashtagRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await hashtagRecommendationsPrompt(input);
    return output!;
  }
);

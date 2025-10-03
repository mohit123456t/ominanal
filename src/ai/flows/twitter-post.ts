'use server';

/**
 * @fileOverview Twitter Post Flow
 * This file contains a Genkit flow for posting a tweet to Twitter (X).
 * - postToTwitter - Posts a tweet.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Client, auth } from 'twitter-api-sdk';

const PostToTwitterInputSchema = z.object({
  text: z.string().describe('The content of the tweet.'),
  apiKey: z.string().describe("The user's Twitter App API Key."),
  apiSecret: z.string().describe("The user's Twitter App API Secret Key."),
  accessToken: z.string().describe("The user's Access Token."),
  accessTokenSecret: z.string().describe("The user's Access Token Secret."),
});
export type PostToTwitterInput = z.infer<typeof PostToTwitterInputSchema>;

const PostToTwitterOutputSchema = z.object({
  tweetId: z.string().describe('The ID of the created tweet.'),
  tweetUrl: z.string().url().describe('The URL of the created tweet.'),
});
export type PostToTwitterOutput = z.infer<typeof PostToTwitterOutputSchema>;


const postToTwitterFlow = ai.defineFlow(
  {
    name: 'postToTwitterFlow',
    inputSchema: PostToTwitterInputSchema,
    outputSchema: PostToTwitterOutputSchema,
  },
  async ({ text, apiKey, apiSecret, accessToken, accessTokenSecret }) => {

    // This implementation uses twitter-api-sdk with OAuth 1.0a authentication.
    // It requires the user to provide their app's API key/secret and their own access token/secret.
    const authClient = new auth.OAuth1User({
      apiKey: apiKey,
      apiSecret: apiSecret,
      callback: "http://127.0.0.1:3000/callback", // Callback is required but not used in this 1.0a flow
      accessToken: accessToken,
      accessTokenSecret: accessTokenSecret,
    });

    const twitterClient = new Client(authClient);
    
    try {
        const response = await twitterClient.tweets.createTweet({
            text: text,
        });

        if (!response.data) {
            throw new Error('Failed to create tweet. Response data is empty.');
        }

        const tweetId = response.data.id;
        // The user's handle is not available in the response, so we create a generic URL.
        const tweetUrl = `https://twitter.com/user/status/${tweetId}`;
        
        return {
            tweetId,
            tweetUrl,
        };

    } catch (error: any) {
        console.error("Failed to post tweet:", error);
        const errorMessage = error.body?.detail || error.message || 'An unknown error occurred while posting to Twitter.';
        throw new Error(errorMessage);
    }
  }
);


export async function postToTwitter(input: PostToTwitterInput): Promise<PostToTwitterOutput> {
    return postToTwitterFlow(input);
}

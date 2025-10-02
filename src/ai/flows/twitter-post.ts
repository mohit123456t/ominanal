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
  // In a real OAuth 2.0 flow, we would use access tokens obtained after user authorization.
  // For simplicity in this direct key-based approach, we will need user's access token and secret.
  // These should be stored securely.
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

    // Note: The 'twitter-api-sdk' is primarily designed for OAuth 2.0 user flows.
    // Using direct keys like this is more aligned with the v1.1 API authentication model.
    // A more robust solution would involve a full OAuth 2.0 PKCE flow to get user tokens.
    // For this implementation, we assume the user has provided all four necessary keys.
    const twitterClient = new Client(
        new auth.OAuth2User({
            client_id: process.env.TWITTER_CLIENT_ID!,
            client_secret: process.env.TWITTER_CLIENT_SECRET!,
            callback: "http://localhost:9002/twitter-callback", // This is required but won't be used in this flow
            scopes: ["tweet.read", "users.read", "tweet.write", "offline.access"],
            token: {
                // We are manually setting a token. The SDK is not designed for this,
                // so this is a workaround. A proper implementation would go through the auth flow.
                access_token: accessToken,
                // The SDK doesn't directly support v1.1 style access token secrets,
                // so this part of the auth might be incomplete for v2 write operations
                // without a proper OAuth 2.0 refresh/access token.
            }
        })
    );
    
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
        // The SDK might throw complex error objects. We'll try to extract a meaningful message.
        const errorMessage = error.body?.detail || error.message || 'An unknown error occurred while posting to Twitter.';
        throw new Error(errorMessage);
    }
  }
);


export async function postToTwitter(input: PostToTwitterInput): Promise<PostToTwitterOutput> {
    return postToTwitterFlow(input);
}

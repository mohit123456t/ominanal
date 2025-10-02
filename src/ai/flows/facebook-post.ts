'use server';

/**
 * @fileOverview Facebook Post Flow
 * This file contains a Genkit flow for posting an image to a Facebook Page.
 * - postToFacebook - Posts an image to a user's Facebook Page.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const PostToFacebookInputSchema = z.object({
  facebookPageId: z.string().describe('The ID of the Facebook Page.'),
  mediaUrl: z.string().url().describe('The public URL of the image to post.'),
  caption: z.string().optional().describe('The caption for the post.'),
  accessToken: z.string().describe('The user access token with pages_manage_posts permission.'),
});
export type PostToFacebookInput = z.infer<typeof PostToFacebookInputSchema>;

const PostToFacebookOutputSchema = z.object({
  postId: z.string().describe('The ID of the created Facebook post.'),
});
export type PostToFacebookOutput = z.infer<typeof PostToFacebookOutputSchema>;

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v20.0';

const postToFacebookFlow = ai.defineFlow(
  {
    name: 'postToFacebookFlow',
    inputSchema: PostToFacebookInputSchema,
    outputSchema: PostToFacebookOutputSchema,
  },
  async ({ facebookPageId, mediaUrl, caption, accessToken }) => {

    const postUrl = `${FACEBOOK_GRAPH_API_URL}/${facebookPageId}/photos`;
    
    const params = new URLSearchParams({
        url: mediaUrl,
        access_token: accessToken,
    });

    if (caption) {
        params.append('caption', caption);
    }

    const response = await fetch(postUrl, {
        method: 'POST',
        // The body should not be a stringified URLSearchParams for photos,
        // but rather the params should be in the URL itself for a GET-like POST
        // or a multipart form for an upload. For URL-based photos, params in URL is fine.
        // Let's stick to the URL Search Params in the body as it is a common pattern.
        body: params,
    });


    if (!response.ok) {
        const errorData: any = await response.json();
        console.error('Failed to post to Facebook:', errorData);
        // The error message from Facebook is more descriptive.
        const fbErrorMessage = errorData.error?.message || 'Unknown error';
        throw new Error(`Failed to post to Facebook: ${fbErrorMessage}`);
    }

    const responseData: any = await response.json();
    
    if (!responseData.id) {
        throw new Error('Failed to get post ID from Facebook after publishing.');
    }

    return { postId: responseData.id };
  }
);


export async function postToFacebook(input: PostToFacebookInput): Promise<PostToFacebookOutput> {
    // This is a wrapper function to call the Genkit flow.
    return postToFacebookFlow(input);
}

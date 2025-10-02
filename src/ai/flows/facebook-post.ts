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
  userAccessToken: z.string().describe('The user access token with pages_manage_posts permission.'),
});
export type PostToFacebookInput = z.infer<typeof PostToFacebookInputSchema>;

const PostToFacebookOutputSchema = z.object({
  postId: z.string().describe('The ID of the created Facebook post.'),
});
export type PostToFacebookOutput = z.infer<typeof PostToFacebookOutputSchema>;

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v20.0';

// Helper flow to get a long-lived page access token
const getPageAccessToken = ai.defineFlow(
  {
    name: 'getPageAccessToken',
    inputSchema: z.object({
      pageId: z.string(),
      userAccessToken: z.string(),
    }),
    outputSchema: z.object({ pageAccessToken: z.string() }),
  },
  async ({ pageId, userAccessToken }) => {
    const url = `${FACEBOOK_GRAPH_API_URL}/${pageId}?fields=access_token&access_token=${userAccessToken}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData: any = await response.json();
      console.error('Failed to get Page Access Token:', errorData);
      throw new Error(`Failed to get Page Access Token: ${errorData.error?.message || 'Unknown error'}`);
    }
    const data: any = await response.json();
    if (!data.access_token) {
      throw new Error('Page Access Token not found in response.');
    }
    return { pageAccessToken: data.access_token };
  }
);


const postToFacebookFlow = ai.defineFlow(
  {
    name: 'postToFacebookFlow',
    inputSchema: PostToFacebookInputSchema,
    outputSchema: PostToFacebookOutputSchema,
  },
  async ({ facebookPageId, mediaUrl, caption, userAccessToken }) => {
    
    // Step 1: Get the Page Access Token. This is crucial.
    const { pageAccessToken } = await getPageAccessToken({
        pageId: facebookPageId,
        userAccessToken: userAccessToken
    });

    // Step 2: Use the Page Access Token to post the photo.
    const postUrl = `${FACEBOOK_GRAPH_API_URL}/${facebookPageId}/photos`;
    
    const params = new URLSearchParams({
        url: mediaUrl,
        access_token: pageAccessToken, // Use the page access token here
    });

    if (caption) {
        params.append('caption', caption);
    }
    
    const response = await fetch(postUrl, {
        method: 'POST',
        body: params.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });


    if (!response.ok) {
        const errorData: any = await response.json();
        console.error('Failed to post to Facebook:', errorData);
        // The error message from Facebook is more descriptive.
        const fbErrorMessage = errorData.error?.message || 'Unknown error';
        throw new Error(`Failed to post to Facebook: ${fbErrorMessage}`);
    }

    const responseData: any = await response.json();
    
    // The photo post returns a 'post_id' which is the ID of the post container, and an 'id' which is the photo ID.
    // We want the post ID to construct a URL.
    const postId = responseData.post_id || responseData.id;
    if (!postId) {
        throw new Error('Failed to get post ID from Facebook after publishing.');
    }

    return { postId };
  }
);


export async function postToFacebook(input: PostToFacebookInput): Promise<PostToFacebookOutput> {
    return postToFacebookFlow(input);
}

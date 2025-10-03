'use server';

/**
 * @fileOverview Facebook Post Flow
 * This file contains a Genkit flow for posting an image to a Facebook Page.
 * - postToFacebook - Posts an image to a user's Facebook Page.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import * as crypto from 'crypto';


const PostToFacebookInputSchema = z.object({
  facebookPageId: z.string().describe('The ID of the Facebook Page.'),
  mediaUrl: z.string().url().describe('The public URL of the image to post.'),
  caption: z.string().optional().describe('The caption for the post.'),
  userAccessToken: z.string().describe('The user access token with pages_manage_posts permission.'),
  appSecret: z.string().describe('The Facebook App Secret used to generate appsecret_proof.')
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
  async ({ facebookPageId, mediaUrl, caption, userAccessToken, appSecret }) => {
    
    // Step 1: Get the Page Access Token using the User Access Token.
    // This requires an appsecret_proof to prove the call is from a trusted server.
    const appSecretProof = crypto.createHmac('sha256', appSecret).update(userAccessToken).digest('hex');
    
    const pageTokenUrl = `${FACEBOOK_GRAPH_API_URL}/${facebookPageId}?fields=access_token&access_token=${userAccessToken}&appsecret_proof=${appSecretProof}`;
    const pageTokenResponse = await fetch(pageTokenUrl);
    
    if (!pageTokenResponse.ok) {
        const errorData: any = await pageTokenResponse.json();
        console.error('Failed to get Page Access Token:', errorData);
        throw new Error(`Failed to get Page Access Token: ${errorData.error?.message || 'Unknown error'}`);
    }
    const pageTokenData: any = await pageTokenResponse.json();
    const pageAccessToken = pageTokenData.access_token;
    
    if (!pageAccessToken) {
        throw new Error('Page Access Token not found in response from Facebook.');
    }

    // Step 2: Use the newly acquired Page Access Token to post the photo.
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
        const fbErrorMessage = errorData.error?.message || 'Unknown error';
        throw new Error(`Failed to post to Facebook: ${fbErrorMessage}`);
    }

    const responseData: any = await response.json();
    
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

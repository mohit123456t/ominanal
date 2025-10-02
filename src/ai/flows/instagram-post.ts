'use server';

/**
 * @fileOverview Instagram Post Flow
 * This file contains a Genkit flow for posting an image to Instagram.
 * - postToInstagram - Posts an image to a user's Instagram account.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

const PostToInstagramInputSchema = z.object({
  instagramUserId: z.string().describe('The Instagram User ID.'),
  mediaUrl: z.string().describe('The URL of the image to post.'),
  caption: z.string().optional().describe('The caption for the post.'),
});
export type PostToInstagramInput = z.infer<typeof PostToInstagramInputSchema>;

const PostToInstagramOutputSchema = z.object({
  postId: z.string().describe('The ID of the created Instagram post.'),
});
export type PostToInstagramOutput = z.infer<typeof PostToInstagramOutputSchema>;

const INSTAGRAM_GRAPH_API_URL = 'https://graph.facebook.com/v20.0';

const postToInstagramFlow = ai.defineFlow(
  {
    name: 'postToInstagramFlow',
    inputSchema: PostToInstagramInputSchema,
    outputSchema: PostToInstagramOutputSchema,
  },
  async ({ instagramUserId, mediaUrl, caption }) => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('Instagram Access Token is not configured in .env file.');
    }
    
    // Step 1: Create a container for the media
    const containerUrl = `${INSTAGRAM_GRAPH_API_URL}/${instagramUserId}/media`;
    const containerParams = new URLSearchParams({
      image_url: mediaUrl,
      access_token: accessToken,
    });
    if (caption) {
        containerParams.append('caption', caption);
    }

    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      body: containerParams,
    });

    if (!containerResponse.ok) {
        const errorData: any = await containerResponse.json();
        console.error('Failed to create Instagram media container:', errorData);
        throw new Error(`Failed to create Instagram media container: ${errorData.error?.message || 'Unknown error'}`);
    }

    const containerData: any = await containerResponse.json();
    const creationId = containerData.id;

    if (!creationId) {
      throw new Error('Failed to get creation ID from Instagram.');
    }

    // Step 2: Publish the container
    const publishUrl = `${INSTAGRAM_GRAPH_API_URL}/${instagramUserId}/media_publish`;
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });
    
    // We need to wait a few seconds for the container to be ready for publishing.
    // A more robust solution would poll the container status endpoint.
    await new Promise(resolve => setTimeout(resolve, 5000));

    const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        body: publishParams,
    });

    if (!publishResponse.ok) {
        const errorData: any = await publishResponse.json();
        console.error('Failed to publish Instagram media container:', errorData);
        throw new Error(`Failed to publish Instagram media: ${errorData.error?.message || 'Unknown error'}`);
    }

    const publishData: any = await publishResponse.json();
    const postId = publishData.id;

    if (!postId) {
        throw new Error('Failed to get post ID from Instagram after publishing.');
    }

    return { postId };
  }
);


export async function postToInstagram(input: PostToInstagramInput): Promise<PostToInstagramOutput> {
    // This is a wrapper function to call the Genkit flow.
    return postToInstagramFlow(input);
}

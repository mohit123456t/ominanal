'use server';

/**
 * @fileOverview Instagram Post Flow
 * This file contains a Genkit flow for posting an image to Instagram.
 * - postToInstagram - Posts an image to a user's Instagram account.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const PostToInstagramInputSchema = z.object({
  instagramUserId: z.string().describe('The Instagram User ID.'),
  mediaUrl: z.string().url().describe('The public URL of the image to post.'),
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
    
    // Manually build the request body as a string
    let requestBody = `image_url=${encodeURIComponent(mediaUrl)}&media_type=IMAGE&access_token=${encodeURIComponent(accessToken)}`;
    if (caption) {
        requestBody += `&caption=${encodeURIComponent(caption)}`;
    }
    
    const containerUrl = `${INSTAGRAM_GRAPH_API_URL}/${instagramUserId}/media`;
    
    console.log("Instagram media payload:", requestBody);

    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
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
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });
    
    // A robust solution would poll the container status endpoint.
    // For this example, we'll wait a few seconds.
    // Instagram needs time to process the media before it can be published.
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const publishUrl = `${INSTAGRAM_GRAPH_API_URL}/${instagramUserId}/media_publish`;

    const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        body: publishParams,
    });

    if (!publishResponse.ok) {
        const errorData: any = await publishResponse.json();
        // Poll for container status if it's not ready yet
        if (errorData.error?.code === 9007) { // Error code for media processing
             console.log("Media is still processing, waiting and retrying...");
             await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 more seconds
             const retryResponse = await fetch(publishUrl, {
                 method: 'POST',
                 body: publishParams,
             });
             if (!retryResponse.ok) {
                 const retryErrorData: any = await retryResponse.json();
                 console.error('Failed to publish Instagram media container on retry:', retryErrorData);
                 throw new Error(`Failed to publish Instagram media on retry: ${retryErrorData.error?.message || 'Unknown error'}`);
             }
             const retryPublishData: any = await retryResponse.json();
             const postId = retryPublishData.id;
             if (!postId) throw new Error('Failed to get post ID from Instagram after retry.');
             return { postId };
        }
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

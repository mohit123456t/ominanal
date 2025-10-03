'use server';

/**
 * @fileOverview YouTube Video Upload Flow
 * This file contains a Genkit flow for uploading a video to YouTube.
 * - uploadVideoToYoutube - Uploads a video to a user's channel.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { google } from 'googleapis';
import { Readable } from 'stream';
// This import is no longer needed as we will handle token updates differently or not at all in this flow.
// import { updateYouTubeAccessToken } from '@/actions/youtube';


const uploadVideoToYoutubeFlow = ai.defineFlow({
    name: 'uploadVideoToYoutubeFlow',
    inputSchema: z.object({
      userId: z.string().describe('The ID of the user uploading the video.'),
      accountId: z.string().describe('The ID of the social media account for YouTube.'),
      videoDataUri: z.string().describe('The video file as a data URI.'),
      title: z.string().describe('The title of the video.'),
      description: z.string().describe('The description of the video.'),
      accessToken: z.string().describe('The current YouTube access token.'),
      refreshToken: z.string().optional().describe('The YouTube refresh token.'),
      clientId: z.string(),
      clientSecret: z.string(),
    }),
    outputSchema: z.object({
      videoId: z.string().describe('The ID of the uploaded video.'),
      videoUrl: z.string().url().describe('The URL of the uploaded video.'),
    }),
}, async ({ userId, accountId, videoDataUri, title, description, accessToken, refreshToken, clientId, clientSecret }) => {
    
    if (!process.env.NEXT_PUBLIC_URL ||!process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI) {
        throw new Error('YouTube redirect URI or Public URL is not configured by the app owner in the .env file.');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${process.env.NEXT_PUBLIC_URL}${process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI}`
    );

    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    // Note: The googleapis library should handle token refreshing automatically if a refresh token is provided.
    // The 'tokens' event listener can be complex to manage in a serverless flow.
    // For simplicity, we'll rely on the auto-refresh. The client should re-authenticate if the refresh token expires.
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      // Test the credentials with a low-quota call before proceeding with the upload
      await youtube.channels.list({ part: ['id'], mine: true });
    } catch (err: any) {
      console.error("Token validation or refresh failed.", err.response?.data || err.message);
      throw new Error("Invalid YouTube credentials or expired refresh token. Please try disconnecting and reconnecting your YouTube account from the API Keys page.");
    }

    const match = videoDataUri.match(/^data:(.*);base64,(.*)$/);
    if (!match) {
        throw new Error('Invalid video data URI format.');
    }
    const videoBuffer = Buffer.from(match[2], 'base64');
    const videoStream = Readable.from(videoBuffer);

    const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: {
                title,
                description,
                tags: ['OmniPostAI', 'AI', 'SocialMedia'],
                categoryId: '28', // Category for "Science & Technology"
            },
            status: {
                privacyStatus: 'private', // Or 'public', 'unlisted'
            },
        },
        media: {
            body: videoStream,
        },
    });

    const videoId = response.data.id;
    if (!videoId) {
        throw new Error('Failed to upload video to YouTube.');
    }
    
    return {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
});

export async function uploadVideoToYoutube(input: z.infer<typeof uploadVideoToYoutubeFlow.inputSchema>): Promise<z.infer<typeof uploadVideoToYoutubeFlow.outputSchema>> {
    return uploadVideoToYoutubeFlow(input);
}

    
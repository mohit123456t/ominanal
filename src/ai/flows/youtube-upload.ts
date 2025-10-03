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
import { updateYouTubeAccessToken } from '@/actions/youtube';


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
    }),
    outputSchema: z.object({
      videoId: z.string().describe('The ID of the uploaded video.'),
      videoUrl: z.string().url().describe('The URL of the uploaded video.'),
    }),
}, async ({ userId, accountId, videoDataUri, title, description, accessToken, refreshToken }) => {
    
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI) {
        throw new Error('YouTube API credentials are not configured in the .env file.');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    oauth2Client.on('tokens', (tokens) => {
        if (tokens.access_token) {
          console.log("Refreshed YouTube access token. Updating in Firestore.");
          updateYouTubeAccessToken({
            userId,
            accountId,
            newAccessToken: tokens.access_token,
          }).catch(err => {
            console.error("Background task to update access token in DB failed:", err);
          });
        }
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      // Check if the access token is expired and refresh it if necessary.
      // The googleapis library handles this automatically if a refresh token is available.
      // We make a simple, low-quota call to trigger the refresh mechanism if needed.
      await youtube.channels.list({ part: ['id'], mine: true });
    } catch (err) {
      console.error("Token refresh or validation failed. The credentials might be invalid.", err);
      throw new Error("Invalid YouTube credentials. Please try disconnecting and reconnecting your YouTube account from the API Keys page.");
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
                categoryId: '28', 
            },
            status: {
                privacyStatus: 'private', 
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

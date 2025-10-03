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
      clientId: z.string(),
      clientSecret: z.string(),
    }),
    outputSchema: z.object({
      videoId: z.string().describe('The ID of the uploaded video.'),
      videoUrl: z.string().url().describe('The URL of the uploaded video.'),
    }),
}, async ({ userId, accountId, videoDataUri, title, description, accessToken, refreshToken, clientId, clientSecret }) => {
    
    if (!process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI) {
        throw new Error('YouTube redirect URI is not configured by the app owner in the .env file.');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${process.env.NEXT_PUBLIC_URL}${process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI}`
    );

    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    // Listen for token refresh events
    oauth2Client.on('tokens', (tokens) => {
        if (tokens.access_token) {
          console.log("Refreshed YouTube access token. Updating in Firestore.");
          // This is a fire-and-forget operation, we don't want to block the upload flow
          updateYouTubeAccessToken({
            userId,
            accountId,
            newAccessToken: tokens.access_token,
          }).catch(err => {
            // Log the error but don't fail the upload. The new token is already in memory for this request.
            console.error("Background task to update access token in DB failed:", err);
          });
        }
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      // The googleapis library should automatically use the refresh token if the access token is expired.
      // We can make a simple, low-quota call to ensure the credentials are valid before the upload.
      await youtube.channels.list({ part: ['id'], mine: true });
    } catch (err: any) {
      console.error("Token validation or refresh failed. The credentials might be invalid.", err);
      // Provide a more user-friendly error message
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

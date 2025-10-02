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

const UploadVideoToYoutubeInputSchema = z.object({
  userId: z.string().describe('The ID of the user uploading the video.'),
  accountId: z.string().describe('The ID of the social media account for YouTube.'),
  videoDataUri: z.string().describe('The video file as a data URI.'),
  title: z.string().describe('The title of the video.'),
  description: z.string().describe('The description of the video.'),
  accessToken: z.string().describe('The current YouTube access token.'),
  refreshToken: z.string().optional().describe('The YouTube refresh token.'),
});
export type UploadVideoToYoutubeInput = z.infer<typeof UploadVideoToYoutubeInputSchema>;

const UploadVideoToYoutubeOutputSchema = z.object({
  videoId: z.string().describe('The ID of the uploaded video.'),
  videoUrl: z.string().url().describe('The URL of the uploaded video.'),
});
export type UploadVideoToYoutubeOutput = z.infer<typeof UploadVideoToYoutubeOutputSchema>;


const uploadVideoToYoutubeFlow = ai.defineFlow({
    name: 'uploadVideoToYoutubeFlow',
    inputSchema: UploadVideoToYoutubeInputSchema,
    outputSchema: UploadVideoToYoutubeOutputSchema,
}, async ({ userId, accountId, videoDataUri, title, description, accessToken, refreshToken }) => {

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    // Listen for token refresh events. This is crucial for long-term use.
    oauth2Client.on('tokens', (tokens) => {
        if (tokens.access_token) {
          console.log("Refreshed YouTube access token. Updating in Firestore.");
          // This is a fire-and-forget operation. We don't want to block the upload
          // while waiting for the database update.
          updateYouTubeAccessToken({
            userId,
            accountId,
            newAccessToken: tokens.access_token,
          }).catch(err => {
            // Log the error but don't fail the upload. The new token is already in oauth2Client.
            console.error("Background task to update access token in DB failed:", err);
          });
        }
    });

    const youtube = google.youtube({ version: 'v3' });

    try {
      // Proactively refresh the token if it's close to expiring.
      // This will use the refresh_token if available and necessary.
      // If the access token is valid, it will do nothing.
      // If it fails, it will throw, indicating invalid credentials (e.g., revoked refresh token).
      await oauth2Client.getAccessToken();
    } catch (err) {
      console.error("Token refresh failed. The refresh token might be invalid.", err);
      // Throw a user-friendly error.
      throw new Error("Invalid YouTube credentials. Please try disconnecting and reconnecting your YouTube account from the API Keys page.");
    }


    // Extract content type and base64 data from data URI
    const match = videoDataUri.match(/^data:(.*);base64,(.*)$/);
    if (!match) {
        throw new Error('Invalid video data URI format.');
    }
    const videoBuffer = Buffer.from(match[2], 'base64');
    const videoStream = Readable.from(videoBuffer);

    const response = await youtube.videos.insert({
        auth: oauth2Client, // Pass the authenticated client, which now has a valid token
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

export async function uploadVideoToYoutube(input: UploadVideoToYoutubeInput): Promise<UploadVideoToYoutubeOutput> {
    return uploadVideoToYoutubeFlow(input);
}

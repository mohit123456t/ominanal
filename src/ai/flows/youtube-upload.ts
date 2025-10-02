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

    if (!refreshToken) {
        throw new Error('Missing refresh token for YouTube account. Please reconnect the account.');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    // This listener is critical. It fires when the access token is refreshed.
    // We then trigger a non-blocking server action to update the new token in Firestore.
    oauth2Client.on('tokens', (tokens) => {
        if (tokens.access_token) {
          console.log("Refreshed YouTube access token. Updating in Firestore.");
          // We don't await this, it's a "fire and forget" update.
          updateYouTubeAccessToken({
            userId,
            accountId,
            newAccessToken: tokens.access_token,
          }).catch(err => {
            // Log if the trigger fails, but don't block the upload.
            console.error("Failed to trigger access token update:", err);
          });
        }
    });

    const youtube = google.youtube({ version: 'v3' });

    // Extract content type and base64 data from data URI
    const match = videoDataUri.match(/^data:(.*);base64,(.*)$/);
    if (!match) {
        throw new Error('Invalid video data URI format.');
    }
    const videoBuffer = Buffer.from(match[2], 'base64');
    const videoStream = Readable.from(videoBuffer);

    const response = await youtube.videos.insert({
        auth: oauth2Client, // Pass the authenticated client
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

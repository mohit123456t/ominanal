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
import { getYouTubeCredentials } from '@/actions/youtube';
import { updateYouTubeAccessToken } from '@/actions/youtube';

const UploadVideoToYoutubeInputSchema = z.object({
  userId: z.string().describe('The ID of the user uploading the video.'),
  videoDataUri: z.string().describe('The video file as a data URI.'),
  title: z.string().describe('The title of the video.'),
  description: z.string().describe('The description of the video.'),
  accountId: z.string().describe('The ID of the social media account for YouTube.')
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
}, async ({ userId, accountId, videoDataUri, title, description }) => {

    const credentials = await getYouTubeCredentials({ userId, accountId });
    const { accessToken, refreshToken } = credentials;

    if (!refreshToken) {
        throw new Error('Missing refresh token for YouTube account. Please reconnect the account.');
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
          // IMPORTANT: Update the document with the new access token.
          // We call the server action and don't await it to avoid blocking the main flow.
          updateYouTubeAccessToken({
            userId,
            accountId,
            newAccessToken: tokens.access_token,
          }).catch(err => {
            console.error("Failed to trigger access token update:", err);
          });
        }
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Extract content type and base64 data from data URI
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

export async function uploadVideoToYoutube(input: UploadVideoToYoutubeInput): Promise<UploadVideoToYoutubeOutput> {
    return uploadVideoToYoutubeFlow(input);
}

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
import { getFirestore } from 'firebase-admin/firestore';
import { SocialMediaAccount } from '@/lib/types';
import { initializeApp, getApps, App, credential } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
    initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}


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
    
    const firestore = getFirestore();
    const accountDocRef = firestore.doc(`users/${userId}/socialMediaAccounts/${accountId}`);
    const accountDoc = await accountDocRef.get();

    if (!accountDoc.exists) {
        throw new Error('YouTube account not found for this user.');
    }
    const accountData = accountDoc.data() as SocialMediaAccount;
    const { apiKey: accessToken, refreshToken } = accountData;

    if (!refreshToken) {
        throw new Error('Missing refresh token for YouTube account. Please reconnect the account.');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    // Add a listener for when the token is refreshed.
    oauth2Client.on('tokens', (tokens) => {
        if (tokens.access_token) {
          console.log("Refreshed YouTube access token. Updating in Firestore.");
          // IMPORTANT: Update the document with the new access token.
          // We use .update() and don't await it to avoid blocking the main flow.
          accountDocRef.update({
            apiKey: tokens.access_token,
            updatedAt: new Date().toISOString(),
          }).catch(err => {
            console.error("Failed to update new access token in Firestore:", err);
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

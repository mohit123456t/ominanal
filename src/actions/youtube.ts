'use server';

import { getYoutubeAuthUrl, getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { uploadVideoToYoutube } from '@/ai/flows/youtube-upload';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';

// Helper function to initialize Firebase Admin SDK
function initializeFirebaseAdmin(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }
    // This uses the default service account credentials in a Google Cloud environment.
    return admin.initializeApp();
}

type UpdateTokenParams = {
    userId: string;
    accountId: string;
    newAccessToken: string;
}

export async function updateYouTubeAccessToken({ userId, accountId, newAccessToken }: UpdateTokenParams): Promise<void> {
    initializeFirebaseAdmin();
    const firestore = getFirestore();
    const accountDocRef = firestore.doc(`users/${userId}/socialMediaAccounts/${accountId}`);

    try {
        await accountDocRef.update({
            accessToken: newAccessToken,
            updatedAt: new Date().toISOString(),
        });
        console.log(`Successfully updated access token for account ${accountId}`);
    } catch (error) {
        console.error(`Failed to update access token for account ${accountId}:`, error);
        // We don't re-throw here to avoid crashing the main video upload flow,
        // but we log the error for debugging.
    }
}


// Server Action Wrappers for YouTube Flows

const GetYoutubeAuthUrlInputSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});
export async function getYoutubeAuthUrlAction(input: z.infer<typeof GetYoutubeAuthUrlInputSchema>) {
    return getYoutubeAuthUrl(input);
}


const GetYoutubeTokensInputSchema = z.object({
    code: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
});
export async function getYoutubeTokensAction(input: z.infer<typeof GetYoutubeTokensInputSchema>) {
    return getYoutubeTokens(input);
}

const UploadVideoToYoutubeInputSchema = z.object({
    userId: z.string(),
    accountId: z.string(),
    videoDataUri: z.string(),
    title: z.string(),
    description: z.string(),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
});
export async function uploadVideoToYoutubeAction(input: z.infer<typeof UploadVideoToYoutubeInputSchema>) {
    return uploadVideoToYoutube(input);
}
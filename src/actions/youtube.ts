'use server';

import { getYoutubeAuthUrl, getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { uploadVideoToYoutube } from '@/ai/flows/youtube-upload';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { PlatformCredentials } from '@/lib/types';
import { z } from 'zod';

// Helper function to initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
    if (admin.apps.length === 0) {
        // This uses the default service account credentials in a Google Cloud environment.
        admin.initializeApp();
    }
}


// Helper function to get credentials from Firestore
async function getYouTubeCredentials(userId: string): Promise<{ clientId: string; clientSecret: string }> {
    initializeFirebaseAdmin();
    const firestore = getFirestore();
    const credDocRef = firestore.doc(`users/${userId}/platformCredentials/YouTube`);
    const credDocSnap = await credDocRef.get();

    if (!credDocSnap.exists) {
        throw new Error('YouTube credentials for this user not found in Firestore. Please save them on the API Keys page.');
    }
    const credentials = credDocSnap.data() as PlatformCredentials;
    const { clientId, clientSecret } = credentials;

    if (!clientId || !clientSecret) {
        throw new Error('Incomplete YouTube credentials found in Firestore. Please re-save them on the API Keys page.');
    }
    return { clientId, clientSecret };
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
  userId: z.string(),
});
export async function getYoutubeAuthUrlAction(input: z.infer<typeof GetYoutubeAuthUrlInputSchema>) {
    const { clientId, clientSecret } = await getYouTubeCredentials(input.userId);
    return getYoutubeAuthUrl({ clientId, clientSecret });
}


const GetYoutubeTokensInputSchema = z.object({
    code: z.string(),
    userId: z.string(),
});
export async function getYoutubeTokensAction(input: z.infer<typeof GetYoutubeTokensInputSchema>) {
    const { clientId, clientSecret } = await getYouTubeCredentials(input.userId);
    return getYoutubeTokens({
        code: input.code,
        clientId,
        clientSecret,
    });
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
    const { clientId, clientSecret } = await getYouTubeCredentials(input.userId);
    // Pass all original input fields plus the fetched credentials to the flow
    return uploadVideoToYoutube({ ...input, clientId, clientSecret });
}

'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, credential } from 'firebase-admin';
import { SocialMediaAccount } from '@/lib/types';

// Helper function to initialize Firebase Admin SDK
function initializeFirebaseAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    // This uses the default service account credentials in a Google Cloud environment.
    return initializeApp({
        credential: credential.applicationDefault(),
    });
}

type GetCredentialsParams = {
    userId: string;
    accountId: string;
}

type Credentials = {
    accessToken: string;
    refreshToken: string | undefined;
}

export async function getYouTubeCredentials({ userId, accountId }: GetCredentialsParams): Promise<Credentials> {
    initializeFirebaseAdmin();
    const firestore = getFirestore();

    const accountDocRef = firestore.doc(`users/${userId}/socialMediaAccounts/${accountId}`);
    const accountDoc = await accountDocRef.get();

    if (!accountDoc.exists) {
        throw new Error('YouTube account not found for this user.');
    }

    const accountData = accountDoc.data() as SocialMediaAccount;

    return {
        accessToken: accountData.apiKey,
        refreshToken: accountData.refreshToken,
    };
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
            apiKey: newAccessToken,
            updatedAt: new Date().toISOString(),
        });
        console.log(`Successfully updated access token for account ${accountId}`);
    } catch (error) {
        console.error(`Failed to update access token for account ${accountId}:`, error);
        // We don't re-throw here to avoid crashing the main video upload flow,
        // but we log the error for debugging.
    }
}

'use server';

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

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

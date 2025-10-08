
import type { NextApiRequest, NextApiResponse } from 'next';
import { getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { getFirestore, doc, collection, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';
import { getAuth } from 'firebase/auth';

// Helper to initialize Firebase Admin SDK
function initializeFirebaseSDK() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error, state } = req.query;

    if (error) {
        console.error('YouTube callback error:', error);
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('YouTube connection was denied or failed.')}`);
    }

    if (!code || typeof code !== 'string') {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request. No authorization code found.')}`);
    }

    if (!state || typeof state !== 'string') {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request. State (user identification) is missing.')}`);
    }
    const userId = state;

    try {
        const app = initializeFirebaseSDK();
        const firestore = getFirestore(app);

        // Fetch credentials
        const credsRef = doc(firestore, 'users', userId, 'platformCredentials', 'YouTube');
        const credsSnap = await getDoc(credsRef);
        if (!credsSnap.exists()) {
            throw new Error("YouTube credentials are not configured for this user. Please save them on the API Keys page.");
        }
        const credentials = credsSnap.data() as PlatformCredentials;
        
        // Construct the redirect URI using server-side environment variables
        const redirectUri = `${process.env.APP_URL}${process.env.YOUTUBE_REDIRECT_URI}`;
        if(!process.env.APP_URL || !process.env.YOUTUBE_REDIRECT_URI){
            throw new Error("Server environment variables for YouTube redirect URI are not correctly set by the app owner.");
        }

        const { accessToken, refreshToken } = await getYoutubeTokens({
            code,
            clientId: credentials.clientId!,
            clientSecret: credentials.clientSecret!,
            redirectUri: redirectUri,
        });

        // Use the obtained access token to get channel details
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${accessToken}`;
        const channelResponse = await fetch(youtubeApiUrl);
        const channelData = await channelResponse.json();
        
        if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
            console.error("YouTube API Error:", channelData);
            throw new Error("Could not fetch YouTube channel details. The access token might be invalid or permissions are missing.");
        }
        
        const channelId = channelData.items[0].id;
        const channelName = channelData.items[0]?.snippet?.title || 'YouTube Account';

        // Save the account to Firestore
        const socialMediaAccountsCollection = collection(firestore, 'users', userId, 'socialMediaAccounts');
        const accountDocRef = doc(socialMediaAccountsCollection, channelId); // Use channel ID as the document ID for uniqueness

        const newAccountData: Omit<SocialMediaAccount, 'id'> = {
            userId: userId,
            platform: 'YouTube',
            accessToken: accessToken,
            refreshToken: refreshToken,
            connected: true,
            username: channelName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await setDoc(accountDocRef, newAccountData, { merge: true });
        
        // Redirect back to the app on success
        res.redirect('/uploader_panel?view=connected-accounts&success=true');

    } catch (err: any) {
        console.error('Full YouTube callback error:', err);
        const errorMessage = err.message || 'An unknown error occurred while connecting to YouTube.';
        res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent(errorMessage)}`);
    }
}

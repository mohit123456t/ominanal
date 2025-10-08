import type { NextApiRequest, NextApiResponse } from 'next';
import { getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { getFirestore, doc, collection, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';


if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const firestore = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error } = req.query;

    // In a real app, the state parameter should contain the user's UID to prevent CSRF and identify the user.
    // For this demo, we're assuming a default or single-user context for the uploader.
    const userId = "DEFAULT_USER"; 

     if (error) {
        console.error('YouTube callback error:', error);
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('YouTube connection was denied or failed.')}`);
    }

    if (!code || typeof code !== 'string') {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request. No authorization code found.')}`);
    }
     if (!userId) {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('User could not be identified.')}`);
    }

    try {
        const credsRef = doc(firestore, 'users', userId, 'platformCredentials', 'YouTube');
        const credsSnap = await getDoc(credsRef);
        if (!credsSnap.exists()) {
          throw new Error("Could not find YouTube credentials. Please save them on the API Keys page first.");
        }
        const credentials = credsSnap.data() as PlatformCredentials;
        
        // CRITICAL: Use the server-side environment variables to construct the redirect URI.
        const redirectUri = `${process.env.APP_URL}${process.env.YOUTUBE_REDIRECT_URI}`;
        if(!process.env.APP_URL || !process.env.YOUTUBE_REDIRECT_URI){
             throw new Error("Server environment variables for redirect URI are not set.");
        }
        
        const { accessToken, refreshToken } = await getYoutubeTokens({
            code,
            clientId: credentials.clientId!,
            clientSecret: credentials.clientSecret!,
            redirectUri: redirectUri,
        });

        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${accessToken}`;
        const channelResponse = await fetch(youtubeApiUrl);
        const channelData = await channelResponse.json();
        
        if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
            console.error("YouTube API Error:", channelData);
            throw new Error("Could not fetch YouTube channel details. The access token might be invalid or permissions are missing.");
        }
        
        const channelId = channelData.items[0].id;
        const channelName = channelData.items[0]?.snippet?.title || 'YouTube Account';

        const socialMediaAccountsCollection = collection(firestore, 'users', userId, 'socialMediaAccounts');
        const accountDocRef = doc(socialMediaAccountsCollection, channelId); // Use channel ID as doc ID

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

        res.redirect('/uploader_panel?view=connected-accounts&success=true');

    } catch (err: any) {
        console.error('Failed to exchange YouTube token or save account:', err);
        const errorMessage = err.message || 'An unknown error occurred while connecting to YouTube.';
        res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent(errorMessage)}`);
    }
}

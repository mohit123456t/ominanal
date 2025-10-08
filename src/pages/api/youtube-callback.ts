import type { NextApiRequest, NextApiResponse } from 'next';
import { getYoutubeTokens } from '@/ai/flows/youtube-auth';
import { getFirestore, doc, collection, addDoc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';


if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const firestore = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error } = req.query;

    const userId = "DEFAULT_USER"; // Replace with actual user management

     if (error) {
        console.error('YouTube callback error:', error);
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('YouTube connection was denied or failed.')}`);
    }

    if (!code || typeof code !== 'string') {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request. No authorization code found.')}`);
    }
     if (!userId) {
        return res.status(400).json({ error: 'Invalid request', description: 'User session not found.' });
    }

    try {
        const credsRef = doc(firestore, 'users', userId, 'platformCredentials', 'YouTube');
        const credsSnap = await getDoc(credsRef);
        if (!credsSnap.exists()) {
          throw new Error("Could not find YouTube credentials. Please save them on the API Keys page first.");
        }
        const credentials = credsSnap.data() as PlatformCredentials;
        
        const { accessToken, refreshToken } = await getYoutubeTokens({
            code,
            clientId: credentials.clientId!,
            clientSecret: credentials.clientSecret!,
        });

        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${accessToken}`;
        const channelResponse = await fetch(youtubeApiUrl);
        const channelData = await channelResponse.json();
        
        if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
            console.error("YouTube API Error:", channelData);
            throw new Error("Could not fetch YouTube channel details.");
        }
        const channelName = channelData.items[0]?.snippet?.title || 'YouTube Account';

        const socialMediaAccountsCollection = collection(firestore, 'users', userId, 'socialMediaAccounts');
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

        await addDoc(socialMediaAccountsCollection, newAccountData);

        res.redirect('/uploader_panel?view=connected-accounts&success=true');

    } catch (err: any) {
        console.error('Failed to exchange YouTube token or save account:', err);
        const errorMessage = err.message || 'An unknown error occurred while connecting to YouTube.';
        res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent(errorMessage)}`);
    }
}

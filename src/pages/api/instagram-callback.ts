import type { NextApiRequest, NextApiResponse } from 'next';
import { getInstagramAccessToken, getInstagramUserDetails, exchangeForLongLivedToken } from '@/ai/flows/instagram-auth';
import { getFirestore, doc, collection, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';

if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const firestore = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error, state } = req.query;

    // In a real app, the state parameter should contain the user's UID to prevent CSRF and identify the user.
    // For this demo, we're assuming a default or single-user context for the uploader.
    const userId = "DEFAULT_USER"; 

    if (error) {
        console.error('Instagram callback error:', error);
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Instagram connection was denied or failed.')}`);
    }

    if (!code || typeof code !== 'string') {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request. No authorization code found.')}`);
    }

    if (!userId) {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('User could not be identified.')}`);
    }

    try {
        const credsRef = doc(firestore, 'users', userId, 'platformCredentials', 'Instagram');
        const credsSnap = await getDoc(credsRef);
        if (!credsSnap.exists()) {
            throw new Error("Instagram credentials are not configured. Please save your App ID and Secret on the API Keys page.");
        }
        const credentials = credsSnap.data() as PlatformCredentials;

        // Use server-side variables to construct the redirect URI
        const redirectUri = `${process.env.APP_URL}${process.env.INSTAGRAM_REDIRECT_URI}`;
        if (!process.env.APP_URL || !process.env.INSTAGRAM_REDIRECT_URI) {
            throw new Error("Server environment variables for redirect URI are not set.");
        }

        const { accessToken: shortLivedToken } = await getInstagramAccessToken({
            code,
            clientId: credentials.clientId!,
            clientSecret: credentials.clientSecret!,
            redirectUri: redirectUri,
        });
        
        const { longLivedToken } = await exchangeForLongLivedToken({
            shortLivedToken,
            clientId: credentials.clientId!,
            clientSecret: credentials.clientSecret!
        });

        const { username, instagramId, facebookPageId, facebookPageName, pageAccessToken } = await getInstagramUserDetails({
            accessToken: longLivedToken
        });
        
        const socialMediaAccountsCollection = collection(firestore, `users/${userId}/socialMediaAccounts`);

        if (instagramId) {
            const accountDocRef = doc(socialMediaAccountsCollection, instagramId);
            const accountData: Omit<SocialMediaAccount, 'id'> = {
                userId: userId,
                platform: 'Instagram',
                accessToken: longLivedToken,
                pageAccessToken: pageAccessToken,
                username: username,
                instagramId: instagramId,
                facebookPageId: facebookPageId,
                facebookPageName: facebookPageName,
                connected: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            await setDoc(accountDocRef, accountData, { merge: true });
        }

        if (facebookPageId && facebookPageName) {
            const fbAccountDocRef = doc(socialMediaAccountsCollection, facebookPageId);
            const fbAccountData: Omit<SocialMediaAccount, 'id'> = {
              userId: userId,
              platform: 'Facebook',
              accessToken: longLivedToken,
              pageAccessToken: pageAccessToken,
              username: facebookPageName,
              instagramId: instagramId,
              facebookPageId: facebookPageId,
              facebookPageName: facebookPageName,
              connected: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
             await setDoc(fbAccountDocRef, fbAccountData, { merge: true });
        }
        
        res.redirect('/uploader_panel?view=connected-accounts&success=true');

    } catch (err: any) {
        console.error('Failed to exchange Instagram token or save account:', err);
        const errorMessage = err.message || 'An unknown error occurred while connecting to Instagram.';
        res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent(errorMessage)}`);
    }
}

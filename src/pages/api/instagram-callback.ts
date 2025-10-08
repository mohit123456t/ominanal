
import type { NextApiRequest, NextApiResponse } from 'next';
import { getInstagramAccessToken, getInstagramUserDetails, exchangeForLongLivedToken } from '@/ai/flows/instagram-auth';
import { getFirestore, doc, collection, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

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

    // IMPORTANT: In a real app, 'state' should be a JWT or a random string stored in the user's session
    // to prevent CSRF attacks. It would contain the real user ID.
    // For this demonstration, we'll assume a hardcoded user ID.
    const userId = "DEFAULT_USER"; // Replace with actual user ID from state

    if (error) {
        console.error('Instagram callback error:', error);
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Instagram connection was denied or failed.')}`);
    }

    if (!code || typeof code !== 'string') {
        return res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent('Invalid request. No authorization code found.')}`);
    }

    try {
        const app = initializeFirebaseSDK();
        const firestore = getFirestore(app);

        // Fetch credentials for the user
        const credsRef = doc(firestore, 'users', userId, 'platformCredentials', 'Instagram');
        const credsSnap = await getDoc(credsRef);
        if (!credsSnap.exists()) {
            throw new Error("Instagram credentials are not configured for this user. Please save them on the API Keys page.");
        }
        const credentials = credsSnap.data() as PlatformCredentials;
        
        // Construct the redirect URI using server-side environment variables for security
        const redirectUri = `${process.env.APP_URL}${process.env.INSTAGRAM_REDIRECT_URI}`;
        if(!process.env.APP_URL || !process.env.INSTAGRAM_REDIRECT_URI){
            throw new Error("Server environment variables for redirect URI are not correctly set by the app owner.");
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

        // Save Instagram Business Account
        if (instagramId) {
            const accountDocRef = doc(socialMediaAccountsCollection, instagramId);
            const accountData: Omit<SocialMediaAccount, 'id'> = {
                userId: userId,
                platform: 'Instagram',
                accessToken: longLivedToken, // User's long-lived token
                pageAccessToken: pageAccessToken, // Page-specific token
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

        // Save linked Facebook Page
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
        
        // Redirect back to the app on success
        res.redirect('/uploader_panel?view=connected-accounts&success=true');

    } catch (err: any) {
        console.error('Full Instagram callback error:', err);
        const errorMessage = err.message || 'An unknown error occurred while connecting to Instagram.';
        res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent(errorMessage)}`);
    }
}

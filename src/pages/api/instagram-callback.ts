import type { NextApiRequest, NextApiResponse } from 'next';
import { getInstagramAccessToken, getInstagramUserDetails, exchangeForLongLivedToken } from '@/ai/flows/instagram-auth';
import { getFirestore, doc, collection, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';
import { getAuth, signInWithCustomToken } from 'firebase/auth';


// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const firestore = getFirestore();
const auth = getAuth();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error, state, error_description } = req.query;
    
    // In a real app, the state parameter should contain the user's UID to prevent CSRF and identify the user.
    // For this demo, we're assuming a default or single-user context for the uploader.
    // THIS IS A MAJOR SIMPLIFICATION AND NOT PRODUCTION-READY.
    const userId = "DEFAULT_USER";

    if (error) {
        console.error('Instagram callback error:', error_description);
        return res.status(400).json({ error: 'Connection failed', description: error_description });
    }

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Invalid request', description: 'No authorization code found.' });
    }
     if (!userId) {
        return res.status(400).json({ error: 'Invalid request', description: 'User could not be identified.' });
    }


    try {
        const credsRef = doc(firestore, 'users', userId, 'platformCredentials', 'Instagram');
        const credsSnap = await getDoc(credsRef);
        if (!credsSnap.exists()) {
          throw new Error("Could not find Instagram credentials. Please save your App ID and Secret in the API Credentials page first.");
        }

        const credentials = credsSnap.data() as PlatformCredentials;
        if (!credentials.clientId || !credentials.clientSecret) {
          throw new Error("Client ID or Client Secret is missing from your saved credentials.");
        }

        const { accessToken: shortLivedToken } = await getInstagramAccessToken({ 
            code, 
            clientId: credentials.clientId, 
            clientSecret: credentials.clientSecret 
        });

        const { longLivedToken } = await exchangeForLongLivedToken({
            shortLivedToken,
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret
        });
        
        if (!longLivedToken) {
          throw new Error('Failed to retrieve a valid long-lived access token.');
        }

        const { username, instagramId, facebookPageId, facebookPageName, pageAccessToken } = await getInstagramUserDetails({ 
            accessToken: longLivedToken
        });

        const socialMediaAccountsCollection = collection(firestore, `users/${userId}/socialMediaAccounts`);
        
        // Use the Instagram ID as the document ID to prevent duplicates
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

        // Use setDoc with merge to create or update the account
        await setDoc(accountDocRef, accountData, { merge: true });

        // Check if a Facebook Page was also returned and create/update it
        if (facebookPageId && facebookPageName) {
            const fbAccountDocRef = doc(socialMediaAccountsCollection, facebookPageId);
            const fbAccountData: Omit<SocialMediaAccount, 'id'> = {
              userId: userId,
              platform: 'Facebook',
              accessToken: longLivedToken,
              pageAccessToken: pageAccessToken,
              username: facebookPageName,
              instagramId: instagramId, // link back to the IG account
              facebookPageId: facebookPageId,
              facebookPageName: facebookPageName,
              connected: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
             await setDoc(fbAccountDocRef, fbAccountData, { merge: true });
        }


        // Redirect user back to the app
        res.redirect('/uploader_panel?view=connected-accounts&success=true');

    } catch (err: any) {
        console.error('Failed to exchange token or save account:', err);
        const errorMessage = err.message || 'An error occurred while finalizing the connection.';
        res.redirect(`/uploader_panel?view=api-keys&error=${encodeURIComponent(errorMessage)}`);
    }
}

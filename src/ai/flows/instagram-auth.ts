'use server';

/**
 * @fileOverview Instagram Authentication Flow
 * This file contains Genkit flows for handling Instagram Basic Display API OAuth2 authentication.
 * - getInstagramAuthUrl - Generates a URL for the user to grant access.
 * - getInstagramAccessToken - Exchanges an auth code for a short-lived access token.
 * - getInstagramUserDetails - Fetches user profile details (id, username).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

const INSTAGRAM_APP_ID = process.env.FACEBOOK_CLIENT_ID;
const INSTAGRAM_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/instagram-callback` : 'https://localhost:9002/instagram-callback';


// #################### Get Auth URL Flow ####################

const GetInstagramAuthUrlOutputSchema = z.object({
  url: z.string().url().describe('The URL to redirect the user to for authentication.'),
});
export type GetInstagramAuthUrlOutput = z.infer<typeof GetInstagramAuthUrlOutputSchema>;

const getInstagramAuthUrlFlow = ai.defineFlow(
  {
    name: 'getInstagramAuthUrlFlow',
    outputSchema: GetInstagramAuthUrlOutputSchema,
  },
  async () => {
    if (!INSTAGRAM_APP_ID) {
        throw new Error('FACEBOOK_CLIENT_ID is not set in .env file.');
    }
    const params = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'instagram_basic,pages_show_list,instagram_content_publish',
        response_type: 'code',
        state: 'XOgiVQIYbuN4CHeFLE9BYhj7Snw1' // Using a static state for now. Should be dynamic in a real app.
    });
    const url = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
    return { url };
  }
);

export async function getInstagramAuthUrl(): Promise<GetInstagramAuthUrlOutput> {
  return getInstagramAuthUrlFlow();
}


// #################### Get Access Token Flow ####################

const GetInstagramAccessTokenInputSchema = z.object({
    code: z.string().describe('The authorization code from the redirect.'),
});
export type GetInstagramAccessTokenInput = z.infer<typeof GetInstagramAccessTokenInputSchema>;

const GetInstagramAccessTokenOutputSchema = z.object({
    accessToken: z.string(),
});
export type GetInstagramAccessTokenOutput = z.infer<typeof GetInstagramAccessTokenOutputSchema>;


const getInstagramAccessTokenFlow = ai.defineFlow({
    name: 'getInstagramAccessTokenFlow',
    inputSchema: GetInstagramAccessTokenInputSchema,
    outputSchema: GetInstagramAccessTokenOutputSchema,
}, async ({ code }) => {
    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
        throw new Error('Instagram App ID or Secret is not configured in .env file.');
    }
    
    const url = `https://graph.facebook.com/v20.0/oauth/access_token`;
    const params = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: 'authorization_code',
    });

    const response = await fetch(`${url}?${params.toString()}`);

    if (!response.ok) {
        const errorData: any = await response.json();
        console.error('Failed to get Instagram access token:', errorData);
        throw new Error(`Failed to get access token: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: any = await response.json();
    
    // For instagram graph api, we need to exchange the short-lived token for a long-lived one
    // but for now, we will use the short-lived one. A real app would do this.
    
    return { accessToken: data.access_token };
});

export async function getInstagramAccessToken(input: GetInstagramAccessTokenInput): Promise<GetInstagramAccessTokenOutput> {
    return getInstagramAccessTokenFlow(input);
}


// #################### Get User Details Flow ####################

const GetInstagramUserDetailsInputSchema = z.object({
    accessToken: z.string(),
});
export type GetInstagramUserDetailsInput = z.infer<typeof GetInstagramUserDetailsInputSchema>;

const GetInstagramUserDetailsOutputSchema = z.object({
    username: z.string(),
    instagramId: z.string(),
});
export type GetInstagramUserDetailsOutput = z.infer<typeof GetInstagramUserDetailsOutputSchema>;

const getInstagramUserDetailsFlow = ai.defineFlow({
    name: 'getInstagramUserDetailsFlow',
    inputSchema: GetInstagramUserDetailsInputSchema,
    outputSchema: GetInstagramUserDetailsOutputSchema,
}, async ({ accessToken }) => {
    // This part is complex because you first need to get the Facebook Page linked to the Instagram account.
    // Then use the page's access token and ID to get the Instagram Business Account ID.

    // 1. Get user's pages
    const pagesUrl = `https://graph.facebook.com/me/accounts?access_token=${accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    if (!pagesResponse.ok) throw new Error('Failed to fetch Facebook pages.');
    const pagesData: any = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error('No Facebook Page linked to this account. Please link a Page with an Instagram Business account.');
    }
    
    // 2. Find a page with an Instagram account linked
    const pageWithIg = pagesData.data.find((page: any) => page.instagram_business_account);

    if (!pageWithIg) {
        throw new Error('No linked Instagram Business Account found on any of your Facebook Pages.');
    }

    const instagramBusinessAccountId = pageWithIg.instagram_business_account.id;

    // 3. Get Instagram account details (username)
    const igUrl = `https://graph.facebook.com/${instagramBusinessAccountId}?fields=username&access_token=${accessToken}`;
    const igResponse = await fetch(igUrl);

    if (!igResponse.ok) {
        const errorData: any = await igResponse.json();
        console.error('Failed to get Instagram user details:', errorData);
        throw new Error(`Failed to get user details: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data: any = await igResponse.json();
    return { username: data.username, instagramId: instagramBusinessAccountId };
});

export async function getInstagramUserDetails(input: GetInstagramUserDetailsInput): Promise<GetInstagramUserDetailsOutput> {
    return getInstagramUserDetailsFlow(input);
}

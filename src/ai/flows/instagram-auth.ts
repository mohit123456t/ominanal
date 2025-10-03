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


// #################### Get Auth URL Flow ####################
const GetInstagramAuthUrlInputSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});
export type GetInstagramAuthUrlInput = z.infer<typeof GetInstagramAuthUrlInputSchema>;

const GetInstagramAuthUrlOutputSchema = z.object({
  url: z.string().url().describe('The URL to redirect the user to for authentication.'),
});
export type GetInstagramAuthUrlOutput = z.infer<typeof GetInstagramAuthUrlOutputSchema>;

const getInstagramAuthUrlFlow = ai.defineFlow(
  {
    name: 'getInstagramAuthUrlFlow',
    inputSchema: GetInstagramAuthUrlInputSchema,
    outputSchema: GetInstagramAuthUrlOutputSchema,
  },
  async ({ clientId }) => {
    if (!process.env.NEXT_PUBLIC_URL) {
        throw new Error('NEXT_PUBLIC_URL is not set in .env file.');
    }
    const redirectUri = `${process.env.NEXT_PUBLIC_URL}/instagram-callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'instagram_basic,pages_show_list,instagram_content_publish,pages_manage_posts,pages_read_engagement',
        response_type: 'code',
        state: 'XOgiVQIYbuN4CHeFLE9BYhj7Snw1' 
    });
    const url = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
    return { url };
  }
);

export async function getInstagramAuthUrl(input: GetInstagramAuthUrlInput): Promise<GetInstagramAuthUrlOutput> {
  return getInstagramAuthUrlFlow(input);
}


// #################### Get Access Token Flow ####################

const GetInstagramAccessTokenInputSchema = z.object({
    code: z.string().describe('The authorization code from the redirect.'),
    clientId: z.string(),
    clientSecret: z.string(),
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
}, async ({ code, clientId, clientSecret }) => {
    if (!process.env.NEXT_PUBLIC_URL) {
        throw new Error('NEXT_PUBLIC_URL is not configured in .env file.');
    }
    const redirectUri = `${process.env.NEXT_PUBLIC_URL}/instagram-callback`;
    
    const url = `https://graph.facebook.com/v20.0/oauth/access_token`;
    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
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
    if (!data.access_token) {
        throw new Error('Access Token not found in the response from Facebook.');
    }
    
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
    facebookPageId: z.string(),
    facebookPageName: z.string(),
});
export type GetInstagramUserDetailsOutput = z.infer<typeof GetInstagramUserDetailsOutputSchema>;

const getInstagramUserDetailsFlow = ai.defineFlow({
    name: 'getInstagramUserDetailsFlow',
    inputSchema: GetInstagramUserDetailsInputSchema,
    outputSchema: GetInstagramUserDetailsOutputSchema,
}, async ({ accessToken }) => {
    
    // Step 1: Get the user's Facebook Pages that they have granted permission for.
    const pagesUrl = `https://graph.facebook.com/me/accounts?fields=instagram_business_account,name&access_token=${accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    if (!pagesResponse.ok) {
        const errorData : any = await pagesResponse.json();
        throw new Error(`Failed to fetch Facebook pages: ${errorData.error?.message}`);
    }
    const pagesData: any = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error('No Facebook Page linked to this account. Please go to Facebook Business settings and link a Page with an Instagram Business account.');
    }
    
    // Step 2: Find the first page that has an Instagram Business Account linked.
    const pageWithIg = pagesData.data.find((page: any) => page.instagram_business_account);

    if (!pageWithIg) {
        throw new Error('No linked Instagram Business Account found on any of your Facebook Pages. Please check your Facebook Page settings.');
    }

    const instagramBusinessAccountId = pageWithIg.instagram_business_account.id;
    const facebookPageId = pageWithIg.id;
    const facebookPageName = pageWithIg.name;

    // Step 3: Use the Instagram Business Account ID to get the username.
    const igUrl = `https://graph.facebook.com/${instagramBusinessAccountId}?fields=username&access_token=${accessToken}`;
    const igResponse = await fetch(igUrl);

    if (!igResponse.ok) {
        const errorData: any = await igResponse.json();
        console.error('Failed to get Instagram user details:', errorData);
        throw new Error(`Failed to get Instagram user details: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data: any = await igResponse.json();
    
    return { 
        username: data.username, 
        instagramId: instagramBusinessAccountId, 
        facebookPageId: facebookPageId, 
        facebookPageName: facebookPageName 
    };
});

export async function getInstagramUserDetails(input: GetInstagramUserDetailsInput): Promise<GetInstagramUserDetailsOutput> {
    return getInstagramUserDetailsFlow(input);
}

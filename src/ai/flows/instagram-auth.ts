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
        scope: 'user_profile,user_media',
        response_type: 'code',
    });
    const url = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
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
    
    const body = new URLSearchParams();
    body.append('client_id', INSTAGRAM_APP_ID);
    body.append('client_secret', INSTAGRAM_APP_SECRET);
    body.append('grant_type', 'authorization_code');
    body.append('redirect_uri', REDIRECT_URI);
    body.append('code', code);

    const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
    });

    if (!response.ok) {
        const errorData: any = await response.json();
        console.error('Failed to get Instagram access token:', errorData);
        throw new Error(`Failed to get access token: ${errorData.error_message || 'Unknown error'}`);
    }

    const data: any = await response.json();
    
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
    const url = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
    const response = await fetch(url);

    if (!response.ok) {
        const errorData: any = await response.json();
        console.error('Failed to get Instagram user details:', errorData);
        throw new Error(`Failed to get user details: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data: any = await response.json();
    return { username: data.username, instagramId: data.id };
});

export async function getInstagramUserDetails(input: GetInstagramUserDetailsInput): Promise<GetInstagramUserDetailsOutput> {
    return getInstagramUserDetailsFlow(input);
}

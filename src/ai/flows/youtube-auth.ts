'use server';

/**
 * @fileOverview YouTube Authentication Flow
 * This file contains Genkit flows for handling YouTube OAuth2 authentication.
 * - getYoutubeAuthUrl - Generates a URL for the user to grant channel access.
 * - getYoutubeTokens - Exchanges an auth code for access and refresh tokens.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { google } from 'googleapis';

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
];

const GetYoutubeAuthUrlInputSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});
export type GetYoutubeAuthUrlInput = z.infer<typeof GetYoutubeAuthUrlInputSchema>;

const getYoutubeAuthUrlFlow = ai.defineFlow(
  {
    name: 'getYoutubeAuthUrlFlow',
    inputSchema: GetYoutubeAuthUrlInputSchema,
    outputSchema: z.object({
      url: z.string().url().describe('The URL to redirect the user to for authentication.'),
    }),
  },
  async ({ clientId, clientSecret }) => {
    // This flow uses the NEXT_PUBLIC_ prefixed variables as it's initiated from the client-side context.
    if (!process.env.NEXT_PUBLIC_URL || !process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI) {
        throw new Error('YouTube redirect URI or public URL is not configured in the .env file. The app owner needs to set these.');
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_URL}${process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI}`;

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: YOUTUBE_SCOPES,
      prompt: 'consent',
    });
    return { url };
  }
);

export async function getYoutubeAuthUrl(input: GetYoutubeAuthUrlInput): Promise<z.infer<typeof getYoutubeAuthUrlFlow.outputSchema>> {
  return getYoutubeAuthUrlFlow(input);
}

const GetYoutubeTokensInputSchema = z.object({
    code: z.string().describe('The authorization code from the redirect.'),
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string().url(),
});
export type GetYoutubeTokensInput = z.infer<typeof GetYoutubeTokensInputSchema>;


const getYoutubeTokensFlow = ai.defineFlow({
    name: 'getYoutubeTokensFlow',
    inputSchema: GetYoutubeTokensInputSchema,
    outputSchema: z.object({
      accessToken: z.string(),
      refreshToken: z.string().optional(),
      expiryDate: z.number(),
    }),
}, async ({ code, clientId, clientSecret, redirectUri }) => {
    
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token || !tokens.expiry_date) {
        throw new Error('Failed to retrieve access token.');
    }
    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date,
    };
});

export async function getYoutubeTokens(input: GetYoutubeTokensInput): Promise<z.infer<typeof getYoutubeTokensFlow.outputSchema>> {
    return getYoutubeTokensFlow(input);
}

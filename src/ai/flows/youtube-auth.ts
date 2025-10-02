'use server';

/**
 * @fileOverview YouTube Authentication Flow
 * This file contains Genkit flows for handling YouTube OAuth2 authentication.
 * - getYoutubeAuthUrl - Generates a URL for the user to grant channel access.
 * - getYoutubeTokens - Exchanges an auth code for access and refresh tokens.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
];

const redirectUri = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI || 'https://6000-firebase-studio-1759399651500.cluster-c36dgv2kibakqwbbbsgmia3fny.cloudworkstations.dev/youtube-callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  redirectUri
);

const GetYoutubeAuthUrlOutputSchema = z.object({
  url: z.string().url().describe('The URL to redirect the user to for authentication.'),
});
export type GetYoutubeAuthUrlOutput = z.infer<typeof GetYoutubeAuthUrlOutputSchema>;

const getYoutubeAuthUrlFlow = ai.defineFlow(
  {
    name: 'getYoutubeAuthUrlFlow',
    outputSchema: GetYoutubeAuthUrlOutputSchema,
  },
  async () => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: YOUTUBE_SCOPES,
      // A refresh token is only returned on the first authorization.
      prompt: 'consent',
    });
    return { url };
  }
);

export async function getYoutubeAuthUrl(): Promise<GetYoutubeAuthUrlOutput> {
  return getYoutubeAuthUrlFlow();
}


const GetYoutubeTokensInputSchema = z.object({
  code: z.string().describe('The authorization code from the redirect.'),
});
export type GetYoutubeTokensInput = z.infer<typeof GetYoutubeTokensInputSchema>;

const GetYoutubeTokensOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiryDate: z.number(),
});
export type GetYoutubeTokensOutput = z.infer<typeof GetYoutubeTokensOutputSchema>;


const getYoutubeTokensFlow = ai.defineFlow({
    name: 'getYoutubeTokensFlow',
    inputSchema: GetYoutubeTokensInputSchema,
    outputSchema: GetYoutubeTokensOutputSchema,
}, async ({ code }) => {
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

export async function getYoutubeTokens(input: GetYoutubeTokensInput): Promise<GetYoutubeTokensOutput> {
    return getYoutubeTokensFlow(input);
}

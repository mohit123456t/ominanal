'use server';
/**
 * @fileOverview AI campaign idea generation flow.
 *
 * - generateCampaignIdeas - A function that generates creative campaign concepts and post ideas based on a user's goal.
 * - AICampaignIdeaInput - The input type for the generateCampaignIdeas function.
 * - AICampaignIdeaOutput - The return type for the generateCampaignIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICampaignIdeaInputSchema = z.object({
  goal: z.string().describe('The user\u2019s goal for the campaign (e.g., \"New product launch\" or \"Holiday sale\").'),
});
export type AICampaignIdeaInput = z.infer<typeof AICampaignIdeaInputSchema>;

const AICampaignIdeaOutputSchema = z.object({
  campaignConcept: z.string().describe('A creative concept for the campaign.'),
  postIdeas: z.array(z.string()).describe('A list of post ideas for the campaign.'),
});
export type AICampaignIdeaOutput = z.infer<typeof AICampaignIdeaOutputSchema>;

export async function generateCampaignIdeas(input: AICampaignIdeaInput): Promise<AICampaignIdeaOutput> {
  return aiCampaignIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCampaignIdeaPrompt',
  input: {schema: AICampaignIdeaInputSchema},
  output: {schema: AICampaignIdeaOutputSchema},
  prompt: `You are a marketing expert specializing in social media campaigns.

You will generate a creative campaign concept and a list of post ideas based on the user's goal.

Goal: {{{goal}}}

Make sure the campaignConcept and PostIdeas are engaging and creative. The PostIdeas should provide enough variety to engage the audience.
`,
});

const aiCampaignIdeaFlow = ai.defineFlow(
  {
    name: 'aiCampaignIdeaFlow',
    inputSchema: AICampaignIdeaInputSchema,
    outputSchema: AICampaignIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

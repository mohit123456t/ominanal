'use server';
/**
 * @fileOverview An AI flow for finding and generating new business leads by simulating web searches.
 * 
 * - findLeads - The main function to find leads based on a query.
 * - Lead - The data structure for a single lead.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for a single lead
const LeadSchema = z.object({
  name: z.string().describe('The name of the brand or company.'),
  email: z.string().email().describe('A plausible contact email for the brand.'),
  mobileNumber: z.string().describe('A plausible contact mobile number for the brand, including country code.'),
  address: z.string().describe('A plausible physical address for the brand.'),
  description: z.string().describe('A short, one-sentence description of what the brand does.'),
});
export type Lead = z.infer<typeof LeadSchema>;

// Define the output schema for the main flow
const FindLeadsOutputSchema = z.object({
  leads: z.array(LeadSchema).describe('A list of potential business leads.'),
});
export type FindLeadsOutput = z.infer<typeof FindLeadsOutputSchema>;

// Define the input schema for the main flow
const FindLeadsInputSchema = z.object({
  query: z.string().describe('The user\'s search query, e.g., "top 10 footwear brands in India".'),
});
export type FindLeadsInput = z.infer<typeof FindLeadsInputSchema>;

/**
 * A tool that simulates searching the web for leads.
 * It uses an LLM to generate realistic-looking lead data based on a search query.
 * In a real-world scenario, this tool's implementation could be replaced with a call
 * to a real search API (e.g., Google Custom Search).
 */
const searchWebForLeads = ai.defineTool(
  {
    name: 'searchWebForLeads',
    description: 'Searches the web to find potential business leads based on a query.',
    inputSchema: FindLeadsInputSchema,
    outputSchema: FindLeadsOutputSchema,
  },
  async (input) => {
    // This prompt asks the LLM to act as a market researcher, synthesizing real-world data.
    const leadsGenerator = await ai.generate({
      prompt: `You are an expert market researcher. Your task is to generate a list of 10 real, existing business leads based on the user's query: "${input.query}". 
      
      To do this, you must act as if you are analyzing real-world public data from sources like Google Maps, LinkedIn, and official business directories. 
      
      For each lead, provide a realistic and accurate-as-possible:
      - Company Name
      - A plausible corporate contact email (e.g., contact@company.com, marketing@brand.com)
      - A plausible business phone number (including country code)
      - The company's real physical address
      - A concise, one-sentence description of the company's business.
      
      The data must look authentic and directly correspond to the user's query. Do not invent fictional companies. Provide the best possible real-world data you can synthesize.`,
      output: {
        schema: FindLeadsOutputSchema,
      },
    });

    const output = leadsGenerator.output;
    if (!output) {
      throw new Error('The AI failed to generate any lead data from the search tool.');
    }
    return output;
  }
);


/**
 * The main flow for finding leads.
 * It takes a user query and uses the searchWebForLeads tool to get the results.
 */
const findLeadsFlow = ai.defineFlow(
  {
    name: 'findLeadsFlow',
    inputSchema: FindLeadsInputSchema,
    outputSchema: FindLeadsOutputSchema,
  },
  async (input) => {
    // Directly call the tool to ensure we get the structured data we need.
    const searchResult = await searchWebForLeads(input);

    if (!searchResult || !searchResult.leads) {
      throw new Error('AI did not return the expected lead data.');
    }
    return searchResult;
  }
);


/**
 * Public-facing wrapper function to call the findLeadsFlow.
 * @param input The search query for finding leads.
 * @returns A promise that resolves to a list of leads.
 */
export async function findLeads(input: FindLeadsInput): Promise<FindLeadsOutput> {
  return findLeadsFlow(input);
}

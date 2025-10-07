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
    // This prompt asks the LLM to act as a search engine.
    const leadsGenerator = await ai.generate({
      prompt: `Imagine you are a web search engine. Based on the query "${input.query}", generate a list of 10 plausible, even if fictional, business leads that match the request. For each lead, provide a realistic-sounding name, email, mobile number, address, and a short description.`,
      output: {
        format: 'json',
        schema: FindLeadsOutputSchema,
      },
    });

    return leadsGenerator.output!;
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
    const llmResponse = await ai.generate({
      prompt: `Find business leads based on the following query: ${input.query}`,
      tools: [searchWebForLeads], // Make the tool available to the LLM
    });

    // The LLM will automatically call the tool if it decides it's necessary.
    // We just need to return the final generated output.
    const output = llmResponse.output;
    if (!output || !('leads' in output)) {
      throw new Error('AI did not return the expected lead data.');
    }
    return output as FindLeadsOutput;
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

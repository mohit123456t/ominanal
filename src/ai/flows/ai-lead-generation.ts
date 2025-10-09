'use server';
/**
 * @fileOverview An AI flow for finding and generating new business leads by using a live Google Search tool.
 * 
 * - findLeads - The main function to find leads based on a query.
 * - Lead - The data structure for a single lead.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';


// Define the schema for a single lead
const LeadSchema = z.object({
  name: z.string().describe('The name of the brand or company.'),
  email: z.string().email().describe('A plausible contact email for the brand.'),
  mobileNumber: z.string().describe('A plausible contact mobile number for the brand, including country code.'),
  address: z.string().describe('A plausible physical address for the brand.'),
  description: z.string().describe('A short, one-sentence description of what the brand does.'),
});
export type Lead = z.infer<typeof LeadSchema>;


const FindLeadsInputSchema = z.object({
  query: z.string().describe("The user's search query to find business leads."),
});
export type FindLeadsInput = z.infer<typeof FindLeadsInputSchema>;


// Define the output schema for the main flow
const FindLeadsOutputSchema = z.object({
  leads: z.array(LeadSchema).describe('A list of 10 potential business leads found from the web search.'),
});
export type FindLeadsOutput = z.infer<typeof FindLeadsOutputSchema>;


const findLeadsFlow = ai.defineFlow(
  {
    name: 'findLeadsFlow',
    inputSchema: FindLeadsInputSchema,
    outputSchema: FindLeadsOutputSchema,
  },
  async (input) => {
    
    // The agentic model will automatically use Google Search when asked to find real-world information.
    const llm = ai.getGenerator('gemini-1.5-flash-latest');

    const response = await llm.generate({
        prompt: `You are an expert market researcher. Your task is to find real-world business leads based on the user's query.
        You MUST use Google Search to find 10 real-world business leads based on the provided query.
        For each lead, you must provide a real name, a plausible email, a plausible mobile number, and a real physical address and a one-sentence description of what the brand does.
        Do not make up information. Use your search tool to find factual data.
        
        User Query: ${input.query}`,
        tools: ['googleSearch'],
        output: {
            schema: FindLeadsOutputSchema,
        },
    });

    const output = response.output;
    if (!output?.leads || output.leads.length === 0) {
      throw new Error('The AI failed to generate any valid leads from the search results.');
    }

    return output;
  }
);


/**
 * Public-facing wrapper function to call the findLeadsFlow.
 * @param input The user's query to find leads.
 * @returns A promise that resolves to the list of found leads.
 */
export async function findLeads(input: FindLeadsInput): Promise<FindLeadsOutput> {
  return findLeadsFlow(input);
}

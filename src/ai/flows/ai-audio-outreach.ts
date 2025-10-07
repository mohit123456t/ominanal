'use server';
/**
 * @fileOverview An AI flow for generating personalized audio outreach messages.
 * 
 * - generateAudioOutreach - Creates a personalized audio message for a business lead.
 * - AudioOutreachInput - The input type for the flow.
 * - AudioOutreachOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// Define the schema for a single lead, consistent with ai-lead-generation
const LeadSchema = z.object({
  name: z.string().describe('The name of the brand or company.'),
  email: z.string().email().describe('A plausible contact email for the brand.'),
  mobileNumber: z.string().describe('A plausible contact mobile number for the brand.'),
  address: z.string().describe('A plausible physical address for the brand.'),
  description: z.string().describe('A short, one-sentence description of what the brand does.'),
});

// Define the input schema for this flow
const AudioOutreachInputSchema = z.object({
  lead: LeadSchema,
});
export type AudioOutreachInput = z.infer<typeof AudioOutreachInputSchema>;

// Define the output schema for this flow
const AudioOutreachOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio message as a Base64 data URI.'),
});
export type AudioOutreachOutput = z.infer<typeof AudioOutreachOutputSchema>;

// Helper function to convert PCM audio buffer to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}


// Define the main flow for generating audio outreach
const generateAudioOutreachFlow = ai.defineFlow(
  {
    name: 'generateAudioOutreachFlow',
    inputSchema: AudioOutreachInputSchema,
    outputSchema: AudioOutreachOutputSchema,
  },
  async ({ lead }) => {
    
    // Step 1: Generate a personalized text script using a text-based model
    const scriptPrompt = `You are a friendly and professional business development representative for OmniPost AI. 
    Your goal is to create a short, engaging, and personalized audio message for a potential lead.
    
    Lead Name: ${lead.name}
    Lead Description: ${lead.description}
    
    Keep the message under 45 seconds. Start by greeting them by name. Mention their company and what they do. 
    Briefly introduce OmniPost AI and suggest a quick chat. End on a positive and friendly note.
    
    Example: "Hello ${lead.name}, this is Alex from OmniPost AI. I came across ${lead.name} and was really impressed by your work in ${lead.description.toLowerCase().includes('in') ? lead.description.split('in ')[1] : 'the industry'}. At OmniPost, we help brands like yours supercharge their social media with AI. I'd love to connect for a brief chat when you have a moment. Have a great day!"
    
    Now, generate a new, unique script for this lead.`;
    
    const scriptGeneration = await ai.generate({
        prompt: scriptPrompt,
        model: googleAI.model('gemini-2.5-flash'), // Using a powerful model for script quality
    });
    
    const script = scriptGeneration.text;
    if (!script) {
        throw new Error('Failed to generate a script for the audio message.');
    }

    // Step 2: Convert the generated script to speech using a TTS model
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A professional and clear voice
          },
        },
      },
      prompt: script,
    });

    if (!media || !media.url) {
      throw new Error('Text-to-Speech model did not return any audio media.');
    }

    // The audio data is Base64 encoded PCM. We need to convert it to a usable WAV format.
    const pcmAudioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(pcmAudioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);


/**
 * Public-facing wrapper function to call the generateAudioOutreachFlow.
 * @param input The lead information for whom to generate the audio message.
 * @returns A promise that resolves to the audio data URI.
 */
export async function generateAudioOutreach(input: AudioOutreachInput): Promise<AudioOutreachOutput> {
  return generateAudioOutreachFlow(input);
}


import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import type { County } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The SDK's streaming response is an AsyncIterable<GenerateContentResponse>
type StreamedResponse = AsyncIterable<GenerateContentResponse>;

export const getInsightStream = async (county: County): Promise<StreamedResponse> => {
  const prompt = `
    Analyze the justice compliance data for ${county.county}, ${county.state}.
    The county has a 'Constitutional Compliance Score' of ${county.compliance_score} out of 100.
    The top reported violation types are: ${Object.keys(county.violations).join(', ')}.
    Summarize potential trends and suggest possible areas for reform in 2 concise sentences.
    Adopt a neutral, civic-tech analyst tone.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response;
  } catch (error) {
    console.error("Error fetching insight from Gemini:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};

export const getComparisonInsightStream = async (counties: County[]): Promise<StreamedResponse> => {
  const countyDetails = counties.map(c => 
    `- ${c.county}, ${c.state}: Compliance Score ${c.compliance_score}. Top violations: ${Object.keys(c.violations).join(', ')}.`
  ).join('\n');

  const prompt = `
    Perform a comparative analysis of the justice compliance data for the following counties:
    ${countyDetails}
    
    Highlight key differences in their compliance scores and violation patterns.
    Provide a brief summary of which county appears to be performing better and suggest one area of improvement for the lowest-scoring county.
    Keep the total analysis to 3-4 concise sentences.
    Adopt a neutral, civic-tech analyst tone.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response;
  } catch (error) {
    console.error("Error fetching comparison insight from Gemini:", error);
    throw new Error("Failed to communicate with the Gemini API for comparison.");
  }
};

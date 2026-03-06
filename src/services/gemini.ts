import { GoogleGenAI, Type } from "@google/genai";
import { Incident, MonitoredSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const fetchLatestIncidents = async (monitoredSources: MonitoredSource[] = []): Promise<Incident[]> => {
  try {
    const sourcePrompt = monitoredSources.length > 0 
      ? `EXCLUSIVELY check for the latest updates from this source: ${monitoredSources.map(s => s.url).join(', ')}. 
         Capture EVERY single recent tweet/post from this account as a separate incident. 
         Do not filter them; if they posted it, it must be in the list.`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a specialized intelligence monitor. 
      ${sourcePrompt}
      For each post from the specified source, extract:
      1. A clear title based on the content.
      2. A full description.
      3. The precise location if mentioned (otherwise use a general region or 'Global').
      4. The severity and category.
      
      Return the data as a JSON array of incidents. Ensure timestamps match the actual post times as closely as possible.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              timestamp: { type: Type.STRING, description: "ISO 8601 timestamp" },
              location: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  name: { type: Type.STRING }
                },
                required: ["lat", "lng", "name"]
              },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
              category: { type: Type.STRING, enum: ["military", "cyber", "diplomatic", "other"] },
              sourceUrl: { type: Type.STRING },
              isTweet: { type: Type.BOOLEAN, description: "True if this information was sourced from a tweet/X post" }
            },
            required: ["id", "timestamp", "location", "title", "description", "severity", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as Incident[];
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return [];
  }
};

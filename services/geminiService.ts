import { GoogleGenAI } from "@google/genai";

// Safely initialize the client only when needed to handle potential missing keys gracefully in UI
const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getCourseStrategy = async (courseTitle: string, units: number, description: string): Promise<string> => {
  const client = getClient();
  if (!client) return "API Key not configured. Unable to fetch AI tips.";

  try {
    const prompt = `
      I am a Computer Science ND2 student at Federal Polytechnic Ado-Ekiti.
      I need a concise study strategy to get an 'A' grade in the course: "${courseTitle}".
      It is a ${units}-unit course.
      Description: ${description}.
      
      Please provide 3 specific, actionable bullet points on how to study effectively for this specific subject. 
      Focus on practicals vs theory based on the nature of the course.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate study tips. Please try again later.";
  }
};
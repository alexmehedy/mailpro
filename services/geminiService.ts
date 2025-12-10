import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const geminiService = {
  analyzeSpamScore: async (subject: string, body: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "API Key missing. Cannot analyze.";

    const prompt = `Analyze the following email subject and body for spam triggers. 
    Act as an email deliverability expert.
    
    Subject: ${subject}
    Body Snippet: ${body.substring(0, 500)}...

    Provide a short response (max 50 words) giving it a score out of 10 (10 being clean, 1 being spammy) and one key recommendation to improve inbox placement.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Could not generate analysis.";
    } catch (error) {
      console.error(error);
      return "Error connecting to AI service.";
    }
  },

  generateTemplate: async (topic: string): Promise<{subject: string, html: string}> => {
    const ai = getAiClient();
    if (!ai) throw new Error("API Key missing");

    const prompt = `Create a professional HTML email template for: ${topic}.
    Return ONLY a JSON object with two keys: "subject" and "html". 
    The HTML should be modern, responsive, and use inline CSS suitable for email clients.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error) {
       console.error(error);
       throw error;
    }
  }
};
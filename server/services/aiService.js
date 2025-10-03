import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates an optimized collection route.
 */
export async function getOptimalRoute(bins, startPoint) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `
    You are a logistics and route optimization expert...
    Given a starting depot at location ${JSON.stringify(startPoint)} and bins: ${JSON.stringify(bins)}.
    Calculate the most efficient route.
    Return ONLY as a JSON array of bin IDs in the optimal order. Example: ["bin_102", "bin_105"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating optimal route:", error);
    return bins.map(b => b.binId); // Fallback
  }
}

/**
 * Generates a response for the chatbot.
 */
export async function generateChatResponse(systemPrompt, userMessage) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready." }] },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error("Error from Gemini API:", error);
    return "I'm sorry, I'm having trouble connecting to my AI brain right now.";
  }
}
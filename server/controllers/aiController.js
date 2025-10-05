import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Complaint from '../models/Complaint.js';

// THE FIX: The '__NAVIGATE_TO_MAP__' instruction has been removed from the prompt.
const systemPrompt = `
You are CleanConnect AI, a helpful and concise assistant for a smart city waste management application. Your users are Citizens, Workers, and Officers.
- Your primary goal is to answer questions about sanitation, waste management, recycling, and how to use the CleanConnect app.
- If a user's query can be directly solved by navigating to a page, you MUST include a special token in your response. The token format is __NAVIGATE_TO__('/path/to/page', 'Button Label').
  - Example: If user asks "how do I report an issue?", reply with: "You can report an issue on the Report Issue page. __NAVIGATE_TO__('/citizen/report', 'Go to Report Page')"
- Keep your answers friendly, helpful, and to the point.
`;

export const processChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const user = req.user;

  if (!message) {
    res.status(400); throw new Error('A message is required.');
  }

  // --- Handle Special "Data-Fed" Actions ---
  if (message === 'action:last_report_status' && user.role === 'Citizen') {
    const lastComplaint = await Complaint.findOne({ reportedBy: user._id }).sort({ createdAt: -1 });
    if (lastComplaint) {
      return res.json({ reply: `Your last report for an '${lastComplaint.issueType}' issue is currently marked as '${lastComplaint.status}'.` });
    } else {
      return res.json({ reply: "It looks like you haven't reported any issues yet." });
    }
  }
  
  // --- General Conversational AI using Gemini ---
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    res.status(500); throw new Error('AI service is not configured on the server.');
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;
  
  const requestBody = {
    contents: [{ parts: [{ text: `User query: "${message}"` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  try {
    const { data } = await axios.post(apiUrl, requestBody);
    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data?.error || error.message);
    res.status(500).json({ error: "The AI is currently unavailable due to a server issue." });
  }
});


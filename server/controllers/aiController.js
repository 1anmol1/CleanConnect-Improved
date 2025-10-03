import { generateChatResponse } from '../services/aiService.js';

// SECURE handler for LOGGED-IN users
export const handleChat = async (req, res) => {
  const { message } = req.body;
  // The role is now taken securely from the user object that the
  // 'protect' middleware attached to the request.
  const role = req.user.role; 

  if (!message || !role) {
    return res.status(400).json({ error: 'Message and role are required.' });
  }

  let systemPrompt = '';
  switch (role) {
    case 'Citizen':
      systemPrompt = "You are a helpful assistant for the CleanConnect public portal for Pune...";
      break;
    case 'Worker':
      systemPrompt = "You are a direct and efficient AI assistant for sanitation workers...";
      break;
    case 'Officer':
      systemPrompt = "You are a professional data analyst and operational AI assistant...";
      break;
    default:
      systemPrompt = "You are a general assistant for the CleanConnect platform.";
  }

  try {
    const aiResponse = await generateChatResponse(systemPrompt, message);
    res.json({ reply: aiResponse });
  } catch (error) {
    res.status(500).json({ reply: "An internal server error occurred." });
  }
};

// PUBLIC handler for GUEST users
export const handleGuestChat = async (req, res) => {
  const { message } = req.body;
  const systemPrompt = "You are a helpful assistant for the CleanConnect public portal...";
    
  try {
    const aiResponse = await generateChatResponse(systemPrompt, message);
    res.json({ reply: aiResponse });
  } catch (error) {
    res.status(500).json({ reply: "An internal server error occurred." });
  }
};
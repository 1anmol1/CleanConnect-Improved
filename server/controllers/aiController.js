import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
// This import is now the only dependency on your AI logic
import { generateChatResponse } from '../services/aiService.js';

export const processChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const user = req.user;

  if (!message) {
    res.status(400); throw new Error('A message is required.');
  }

  // --- Handle Special "Data-Fed" Actions that require database access ---
  if (message === 'action:last_report_status' && user.role === 'Citizen') {
    const lastComplaint = await Complaint.findOne({ reportedBy: user._id }).sort({ createdAt: -1 });
    if (lastComplaint) {
      return res.json({ reply: `Your last report for an '${lastComplaint.issueType}' issue is currently marked as '${lastComplaint.status}'.` });
    } else {
      return res.json({ reply: "It looks like you haven't reported any issues yet." });
    }
  }
  
  // --- General Conversational AI ---
  // The controller no longer knows about system prompts. It just asks the "Chef" for a response.
  const aiReply = await generateChatResponse(message);
  res.json({ reply: aiReply });
});
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import chatbotIcon from '../../assets/ai.png';
import './Chatbot.css';

// --- Conversational Templates ---
const conversationTemplates = {
  Citizen: {
    initial: [
      { text: "Report a Sanitation Issue", nextStage: 'report_issue' },
      { text: "Track a Complaint", action: 'send', query: "How do I track my complaint status?" },
      { text: "Find Nearest Dustbin", action: 'send', query: "Where is the nearest smart dustbin?" },
    ],
    report_issue: [
      { text: "Overflowing Bin", action: 'send', query: "I want to report an overflowing dustbin. What information do you need?" },
      { text: "Missed Garbage Pickup", action: 'send', query: "The garbage truck missed pickup on my street. How can I report this?" },
      { text: "Illegal Dumping", action: 'send', query: "I spotted illegal dumping. What should I do?" },
    ],
  },
  Worker: {
    initial: [
      { text: "What is my next task?", action: 'send' },
      { text: "Show my optimized route", action: 'send' },
      { text: "Report an on-site issue", nextStage: 'report_issue' },
    ],
    report_issue: [
      { text: "Bin is damaged", action: 'send', query: "Reporting a damaged bin at my current location." },
      { text: "Road is blocked", action: 'send', query: "The collection route is blocked. I cannot proceed." },
      { text: "Contact my Officer", action: 'contact' },
    ],
  },
  Officer: {
    initial: [
      { text: "Today's Status Summary", action: 'send', query: "Give me a summary of today's sanitation status." },
      { text: "Critical Issues", nextStage: 'critical_issues' },
      { text: "Worker Performance", action: 'send', query: "Show me the performance report for all workers today." },
    ],
    critical_issues: [
      { text: "Unresolved Complaints > 24h", action: 'send', query: "List all critical complaints unresolved for more than 24 hours." },
      { text: "Map of complaint hotspots", action: 'send', query: "Generate a heatmap of current complaint hotspots." },
      { text: "Escalate to Higher Authority", action: 'escalate' },
    ],
  },
  Guest: {
    initial: [
      { text: "What is CleanConnect?", action: 'send' },
      { text: "How can I report an issue?", action: 'send' },
      { text: "How do I sign up?", action: 'send' },
    ]
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState('initial');
  const { user } = useAuth();
  const chatBoxRef = useRef(null);
  const chatbotRef = useRef(null); // Ref for the entire component wrapper

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // --- DEFINITIVE BUG FIX: Corrected "click and scroll outside" logic ---
  useEffect(() => {
    const handleInteractionOutside = (event) => {
      // If the chatbot is open AND the click happened outside the chatbot's container, close it.
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    // Add listeners to the document for both mousedown and scroll events.
    document.addEventListener('mousedown', handleInteractionOutside);
    document.addEventListener('scroll', handleInteractionOutside, true); // Use capture phase for scroll
    
    // Cleanup function to remove listeners when the component unmounts or re-renders.
    return () => {
      document.removeEventListener('mousedown', handleInteractionOutside);
      document.removeEventListener('scroll', handleInteractionOutside, true);
    };
  }, [isOpen]); // This effect re-runs only when the 'isOpen' state changes.

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText = user ? `Hello, ${user.name.split(' ')[0]}! ` : "Hello, Guest! ";
      setMessages([{ sender: 'ai', text: welcomeText + "I am the CleanConnect AI. How can I assist?" }]);
    }
  }, [isOpen, user]);

  const handleSend = async (text, isUserMessage = true) => {
    if (!text.trim()) return;
    if (isUserMessage) {
      setMessages(prev => [...prev, { sender: 'user', text }]);
    }
    setInputValue('');
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/ai/chat', 
        { message: text, role: user?.role || 'Guest' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Please log in to use the full features of the AI assistant.' }]);
    } finally {
      setIsLoading(false);
      setStage('initial');
    }
  };
  
  const handleTemplateClick = (template) => {
    if (template.nextStage) {
      setStage(template.nextStage);
    } else if (template.action === 'send') {
      handleSend(template.query || template.text);
    } // ... other actions can be added here
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Please log in or register to send messages and get personalized assistance." }]);
      return;
    }
    handleSend(inputValue);
  };

  const currentTemplates = (conversationTemplates[user?.role || 'Guest'])[stage] || [];

  return (
    // The ref is now on the outer wrapper div that contains BOTH the button and the window
    <div ref={chatbotRef}>
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="starry-background"></div>
          <h3>CleanConnect Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="close-btn">&times;</button>
        </div>
        <div className="chatbot-messages" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>{msg.text}</div>
          ))}
          {messages.length === 1 && (
            <div className="suggestions-container">
              {currentTemplates.map(template => (
                <button key={template.text} onClick={() => handleTemplateClick(template)} className="suggestion-chip">
                  {template.text}
                </button>
              ))}
            </div>
          )}
          {isLoading && <div className="message ai typing-indicator"><span></span><span></span><span></span></div>}
        </div>
        <div className="chatbot-input">
          {user ? (
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} className="send-btn"><FaPaperPlane /></button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>You are viewing as a guest.</p>
              {/* --- UPDATED: Added onClick to close the chat window --- */}
              <Link to="/login" className="btn btn-primary btn-small" onClick={() => setIsOpen(false)}>
                Login for Full Access
              </Link>
            </div>
          )}
        </div>
      </div>
      <button className="chatbot-toggle-button" onClick={() => setIsOpen(!isOpen)}>
        <img src={chatbotIcon} alt="Open Chatbot" />
      </button>
    </div>
  );
};

export default Chatbot;


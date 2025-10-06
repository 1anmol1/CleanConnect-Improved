import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    FaTimes, FaPaperPlane, FaChevronDown, FaExclamationTriangle, 
    FaGift, FaRoute, FaCheckCircle, FaChartBar, FaUsers, FaRecycle, FaCoins, 
    FaTrash, FaShieldAlt, FaWrench, FaUserPlus, FaMicrophone // 1. Import FaMicrophone
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import chatbotIcon from '../../assets/ai.png';
import './Chatbot.css';

// The 'allRoleActions' object remains the same, defining the smart buttons
const allRoleActions = {
  Citizen: [
    { label: 'Report a New Issue', path: '/citizen/report', icon: <FaExclamationTriangle /> },
    { label: 'View My Rewards', path: '/citizen/rewards', icon: <FaGift /> },
    { label: 'Check Last Report Status', query: 'action:last_report_status', icon: <FaCheckCircle /> },
    { label: 'How do I earn CleanCoins?', query: 'How do I earn points for reporting?', icon: <FaCoins /> },
    { label: 'What is recycling?', query: 'What is recycling and why is it important?', icon: <FaRecycle /> },
    { label: 'How to segregate waste?', query: 'How should I segregate my household waste?', icon: <FaTrash /> },
  ],
  Worker: [
    { label: 'View My Optimized Route', path: '/worker/directions', icon: <FaRoute /> },
    { label: 'See My Resolutions', path: '/worker/resolutions', icon: <FaCheckCircle /> },
    { label: 'Summarize My Daily Tasks', query: 'Summarize my day', icon: <FaChartBar /> },
    { label: 'Report a Route Blockage', query: 'What should I do if a road on my route is blocked?', icon: <FaExclamationTriangle /> },
    { label: 'Safety guidelines for handling waste?', query: 'What are the safety guidelines for handling waste?', icon: <FaShieldAlt /> },
    { label: 'How to report a damaged bin?', query: 'How do I report a bin that is damaged?', icon: <FaWrench /> },
  ],
  Officer: [
    { label: 'Go to Complaint Management', path: '/officer/complaints', icon: <FaChartBar /> },
    { label: 'Add or Manage Workers', path: '/officer/manage-workers', icon: <FaUsers /> },
    { label: 'Get City Stats Summary', query: 'Give me a summary of city-wide stats', icon: <FaChartBar /> },
    { label: 'How do I add a new worker?', query: 'How do I add a new worker to the system?', icon: <FaUserPlus /> },
    { label: 'What is the oldest pending complaint?', query: 'What is the oldest unresolved complaint in the system?', icon: <FaExclamationTriangle /> },
    { label: 'Generate a worker performance report', query: 'Generate a performance report for all workers this week.', icon: <FaChartBar /> },
  ],
};

// The AIMessageParser component remains the same
const AIMessageParser = ({ text, setIsOpen }) => {
  const navigate = useNavigate();
  const navTokenRegex = /__NAVIGATE_TO__\('([^']*)',\s*'([^']*)'(?:,\s*({.*}))?\)/;
  const match = text.match(navTokenRegex);

  if (!match) return <p>{text}</p>;
  
  const [path, label, stateString] = match.slice(1);
  const state = stateString ? JSON.parse(stateString) : undefined;

  const handleNav = () => {
    navigate(path, { state });
    setIsOpen(false);
  };
  const cleanText = text.replace(navTokenRegex, '').trim();

  return (
    <div>
      {cleanText && <p>{cleanText}</p>}
      <div className="action-buttons" style={{ padding: '10px 0 0 0' }}>
        <button onClick={handleNav}>{label}</button>
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [areActionsVisible, setAreActionsVisible] = useState(true);
  const [actionButtonIndex, setActionButtonIndex] = useState(0);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);
  const chatbotRef = useRef(null);

  // --- NEW: State and Refs for Voice Recognition ---
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const speechTimeoutRef = useRef(null); // For the auto-send feature

  // This effect checks for browser support for the Web Speech API on mount.
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
    } else {
      setIsSpeechSupported(false);
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handleOutsideClick = (e) => { if (isOpen && chatbotRef.current && !chatbotRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: 'ai', text: `Hello, ${user?.name.split(' ')[0] || 'Guest'}! How can I assist?` }]);
    } else {
      setMessages([]); setAreActionsVisible(true); setActionButtonIndex(0);
    }
  }, [isOpen, user]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInputValue('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/ai/chat', { message: textToSend }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting to my AI brain right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: Voice Recognition Handler ---
  const handleListen = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = recognitionRef.current;
    recognition.continuous = true; // Keep listening even after pauses
    recognition.interimResults = true; // Get results as the user speaks

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      toast.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      // Clear the auto-send timer every time new speech is detected
      clearTimeout(speechTimeoutRef.current);
      
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setInputValue(transcript); // Update the input box in real-time

      // Set a timer to auto-send if the user pauses for 2 seconds
      speechTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        if (transcript.trim()) {
          handleSendMessage(transcript);
        }
      }, 2000); // 2-second pause
    };
    
    recognition.start();
  };

  const handleSubmit = (e) => { e.preventDefault(); handleSendMessage(inputValue); };
  const handleActionClick = (action) => { handleSendMessage(action.query); setActionButtonIndex(prev => prev + 1); };
  
  const getCurrentActions = () => {
    if (!user) return [];
    const allActions = allRoleActions[user.role] || [];
    const navActions = allActions.filter(a => a.path).filter(a => a.path !== location.pathname).slice(0, 2);
    const dataActions = allActions.filter(a => a.query);
    const dataIndex = actionButtonIndex % dataActions.length;
    const nextDataIndex = (dataIndex + 1) % dataActions.length;
    const relevantDataActions = [dataActions[dataIndex], dataActions[nextDataIndex]].filter(Boolean);
    return [...navActions, ...relevantDataActions];
  };

  const currentActions = getCurrentActions();

  return (
    <div ref={chatbotRef}>
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <header className="chatbot-header"><h2>CleanConnect AI</h2><button onClick={() => setIsOpen(false)} className="close-btn">&times;</button></header>
        <ul className="chatbox" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <li key={index} className={`chat ${msg.sender}`}>
              {msg.sender === 'ai' ? <AIMessageParser text={msg.text} setIsOpen={setIsOpen} /> : <p>{msg.text}</p>}
            </li>
          ))}
          {isLoading && <li className="chat ai"><p className="thinking-indicator"><span></span><span></span><span></span></p></li>}
        </ul>
        
        {user && (
          <div className="action-tray">
            <button className={`tray-toggle-btn ${!areActionsVisible ? 'minimized' : ''}`} onClick={() => setAreActionsVisible(!areActionsVisible)}>
              <FaChevronDown />
            </button>
            {areActionsVisible && (
              <div className="action-buttons">
                {currentActions.map((action) => (
                  <button key={action.label} onClick={() => action.path ? (navigate(action.path), setIsOpen(false)) : handleActionClick(action)}>
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="chatbot-input-box">
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', gap: '10px' }}>
            {/* --- THE NEW MICROPHONE BUTTON --- */}
            {isSpeechSupported && user && (
              <button 
                type="button" 
                onClick={handleListen}
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                title="Speak to Chatbot"
              >
                <FaMicrophone />
              </button>
            )}
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." disabled={isLoading || !user} />
            <button type="submit" disabled={isLoading || !user} className="send-btn"><FaPaperPlane /></button>
          </form>
        </div>
      </div>
      <button className="chatbot-toggler" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <img src={chatbotIcon} alt="Open Chatbot" />}
      </button>
    </div>
  );
};

export default Chatbot;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    FaTimes, FaPaperPlane, FaChevronDown, FaExclamationTriangle, 
    FaGift, FaRoute, FaCheckCircle, FaChartBar, FaUsers, FaRecycle, FaCoins, 
    FaTrash, FaShieldAlt, FaWrench, FaUserPlus, FaMicrophone, FaVolumeUp, FaVolumeMute 
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import chatbotIcon from '../../assets/ai.png';
import './Chatbot.css';

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

// The AIMessageParser component parses AI responses for navigation buttons.
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

const Chatbot = ({ isOpen, setIsOpen, initialMessage, clearInitialMessage }) => {
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

  // --- Voice Feature State and Refs ---
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [lastInteractionWasVoice, setLastInteractionWasVoice] = useState(false);
  const recognitionRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  // This effect sets up the speech recognition engine once.
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    if (SpeechRecognition && speechSynthesis) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }
  }, []);

  // This effect contains all the event handler logic for speech recognition.
  useEffect(() => {
    if (!isSpeechSupported) return;

    const recognition = recognitionRef.current;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      clearTimeout(speechTimeoutRef.current);
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setInputValue(prev => prev + finalTranscript);
      
      // Auto-send after a pause
      speechTimeoutRef.current = setTimeout(() => {
        const currentTranscript = Array.from(event.results).map(r => r[0].transcript).join('');
        if (currentTranscript.trim()) {
          handleSendMessage(currentTranscript, true);
        }
        recognition.stop();
      }, 1500); // 1.5-second pause
    };
  }, [isSpeechSupported]);

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handleOutsideClick = (e) => { if (isOpen && chatbotRef.current && !chatbotRef.current.contains(e.target) && !e.target.closest('.chatbot-toggler')) setIsOpen(false); };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialMessage) {
        setMessages([{ sender: 'ai', text: initialMessage }]);
        setLastInteractionWasVoice(true);
        handleListen(true);
        clearInitialMessage();
      } else if (messages.length === 0) {
        setMessages([{ sender: 'ai', text: `Hello, ${user?.name.split(' ')[0] || 'Guest'}! How can I assist?` }]);
      }
    } else {
      setMessages([]); setAreActionsVisible(true); setActionButtonIndex(0);
      window.speechSynthesis.cancel();
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
    }
  }, [isOpen, user, initialMessage]);

  // --- UPDATED: Text-to-Speech now accepts a callback function ---
  const speak = (text, wasVoiceInteraction, onEndCallback) => {
    const cleanText = text.replace(/__NAVIGATE_TO__\(.*\)/, '').trim();
    if (isTtsEnabled && wasVoiceInteraction && cleanText) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      // This is the key: when the speech finishes, the callback is called.
      utterance.onend = onEndCallback;
      window.speechSynthesis.speak(utterance);
    } else {
      // If we're not speaking, call the callback immediately.
      onEndCallback();
    }
  };

const handleSendMessage = async (textToSend, isFromVoice = false) => {
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

      // We pass the handleListen function as the callback to the speak function.
      // It will be executed ONLY after the AI has finished speaking.
      speak(data.reply, isFromVoice, () => {
        if (isFromVoice) {
          handleListen(true); // Re-open the microphone for the next command
        }
      });
    } catch (error) {
      const errorMsg = "I'm having trouble connecting to my AI brain right now.";
      setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
      speak(errorMsg, isFromVoice, () => {}); // Speak the error
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: A simpler, more robust toggle function for the microphone
  const handleListen = (isContinuation = false) => {
    if (isListening || !recognitionRef.current) {
      recognitionRef.current?.stop();
      return;
    }
    setLastInteractionWasVoice(true); // Set the interaction mode to voice
    if (!isContinuation) toast.info("Listening...");
    recognitionRef.current.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLastInteractionWasVoice(false); // Text submission is not a voice interaction
    handleSendMessage(inputValue, false);
  };
  
  const handleActionClick = (action) => {
    setLastInteractionWasVoice(false); // Button clicks are not voice interactions
    handleSendMessage(action.query, false);
    setActionButtonIndex(prev => prev + 1);
  };
  
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
        <header className="chatbot-header">
          <h2>CleanConnect AI</h2>
          <div className="header-buttons">
            {isSpeechSupported && (
              <button onClick={() => setIsTtsEnabled(!isTtsEnabled)} className="tts-toggle-btn" title={isTtsEnabled ? "Mute AI Voice" : "Unmute AI Voice"}>
                {isTtsEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="close-btn">&times;</button>
          </div>
        </header>
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
            {isSpeechSupported && user && (
              <button 
                type="button" 
                onClick={() => handleListen(false)}
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                title="Speak to Chatbot"
              >
                <FaMicrophone />
              </button>
            )}
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type or speak..." disabled={isLoading || !user} />
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
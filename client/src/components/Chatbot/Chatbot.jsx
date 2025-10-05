import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTimes, FaPaperPlane, FaChevronDown, FaExclamationTriangle, FaGift, FaRoute, FaCheckCircle, FaChartBar, FaUsers } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import chatbotIcon from '../../assets/ai.png';
import './Chatbot.css';

// Defines all possible smart action buttons for each role
const allRoleActions = {
  Citizen: [
    { label: 'Report a New Issue', path: '/citizen/report', icon: <FaExclamationTriangle /> },
    { label: 'View My Rewards', path: '/citizen/rewards', icon: <FaGift /> },
    { label: 'Check Last Report Status', query: 'action:last_report_status' },
    { label: 'How do I earn points?', query: 'How do I earn CleanCoins?' },
  ],
  Worker: [
    { label: 'View My Optimized Route', path: '/worker/directions', icon: <FaRoute /> },
    { label: 'See My Resolutions', path: '/worker/resolutions', icon: <FaCheckCircle /> },
    { label: 'Summarize My Day', query: 'Summarize my day' },
    { label: 'Report Route Blockage', query: 'What should I do if a route is blocked?' },
  ],
  Officer: [
    { label: 'Go to Complaint Management', path: '/officer/complaints', icon: <FaChartBar /> },
    { label: 'Manage Worker Assignments', path: '/officer/manage-workers', icon: <FaUsers /> },
    { label: 'Get City Stats Summary', query: 'Give me a summary of city-wide stats' },
    { label: 'How do I add a new worker?', query: 'How do I add a new worker?' },
  ],
};

// A smart component to parse the AI's response and render navigation buttons
const AIMessageParser = ({ text }) => {
  const navigate = useNavigate();
  const navTokenRegex = /__NAVIGATE_TO__\('([^']*)',\s*'([^']*)'\)/;
  const match = text.match(navTokenRegex);

  if (!match) return <p>{text}</p>;

  const handleNav = () => navigate(match[1]);
  const cleanText = text.replace(navTokenRegex, '').trim();

  return (
    <div>
      <p>{cleanText}</p>
      <div className="action-buttons" style={{ padding: '10px 0 0 0' }}>
        <button onClick={handleNav}>{match[2]}</button>
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [areActionsVisible, setAreActionsVisible] = useState(true); // State for the minimizable tray
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);
  const chatbotRef = useRef(null);

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
      setMessages([{ sender: 'ai', text: `Hello, ${user?.name.split(' ')[0] || 'Guest'}! How can I help?` }]);
    } else {
      setMessages([]); // Reset chat when closed
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
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting to my AI brain." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); handleSendMessage(inputValue); };
  
  // This function gets the 4 smartest buttons for the user's context
  const getCurrentActions = () => {
    if (!user) return [];
    const allActions = allRoleActions[user.role] || [];
    const navActions = allActions.filter(a => a.path);
    const dataActions = allActions.filter(a => a.query);
    // Filter out the nav button for the page the user is currently on
    const relevantNavActions = navActions.filter(a => a.path !== location.pathname);
    // Take the top 2 of each category
    return [...relevantNavActions.slice(0, 2), ...dataActions.slice(0, 2)];
  };

  const currentActions = getCurrentActions();

  return (
    <div ref={chatbotRef}>
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <header className="chatbot-header"><h2>CleanConnect AI</h2><button onClick={() => setIsOpen(false)} className="close-btn">&times;</button></header>
        <ul className="chatbox" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <li key={index} className={`chat ${msg.sender}`}>
              {msg.sender === 'ai' ? <AIMessageParser text={msg.text} /> : <p>{msg.text}</p>}
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
                {currentActions.map(({ label, path, query, icon }) => (
                  <button key={label} onClick={() => path ? (navigate(path), setIsOpen(false)) : handleSendMessage(query)}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="chatbot-input-box">
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', gap: '10px' }}>
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
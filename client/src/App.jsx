import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './hooks/useAuth.js';
import useVoiceAssistant from './hooks/useVoiceAssistant.js';

// --- LAYOUT & CORE COMPONENTS ---
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Chatbot from './components/Chatbot/Chatbot.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// --- PUBLIC PAGES ---
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import OfficerProgress from './pages/Public/OfficerProgress/OfficerProgress.jsx'; 
import PrivacyPolicy from './pages/Public/PrivacyPolicy.jsx';
import TermsAndConditions from './pages/Public/TermsAndConditions.jsx';

// --- CITIZEN PORTAL PAGES ---
import CitizenDashboard from './pages/Citizen/Dashboard/CitizenDashboard.jsx';
import ReportIssue from './pages/Citizen/ReportIssue/ReportIssue.jsx';
import Profile from './pages/Citizen/Profile/Profile.jsx';
import Rewards from './pages/Citizen/Rewards/Rewards.jsx';
import Notifications from './pages/Citizen/Notifications/Notifications.jsx';

// --- WORKER PORTAL PAGES ---
import WorkerDashboard from './pages/Worker/Dashboard/WorkerDashboard.jsx';
import Directions from './pages/Worker/Directions/Directions.jsx';
import NewComplaint from './pages/Worker/NewComplaint/NewComplaint.jsx';
import Resolutions from './pages/Worker/Resolutions/Resolutions.jsx';
import WorkerProfile from './pages/Worker/Profile/WorkerProfile.jsx';
import WorkerNotifications from './pages/Worker/Notifications/WorkerNotifications.jsx';
import WorkerNavigation from './pages/Worker/WorkerNavigation/WorkerNavigation.jsx';

// --- OFFICER PORTAL PAGES ---
import OfficerDashboard from './pages/Officer/Dashboard/OfficerDashboard.jsx';
import WorkerManagement from './pages/Officer/WorkerManagement/WorkerManagement.jsx';
import UpdateBin from './pages/Officer/UpdateBin/UpdateBin.jsx';
import OfficerProfile from './pages/Officer/Profile/OfficerProfile.jsx';
import ComplaintManagement from './pages/Officer/ComplaintManagement/ComplaintManagement.jsx';
import CreateNotification from './pages/Officer/CreateNotification/CreateNotification.jsx';
import WorkerProgress from './pages/Officer/WorkerProgress/WorkerProgress.jsx';

function App() {
  const { user } = useAuth();
  
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [initialChatbotMessage, setInitialChatbotMessage] = useState('');
  
  // Render Cold Start UI State
  const [serverReady, setServerReady] = useState(false);
  const [showWakeMessage, setShowWakeMessage] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const wakeServer = async () => {
      try {
        // If it takes more than 1 second, show the "Waking up" message
        timeoutId = setTimeout(() => setShowWakeMessage(true), 1000);
        
        // This request will hang on Render until the server spins up (approx 50s)
        await axios.get('/health');
        
        clearTimeout(timeoutId);
        setServerReady(true);
      } catch (error) {
        // If the health check fails, we still let them into the app to see the error handled natively,
        // or we could retry. For now, assume it's up if it responds at all.
        console.error("Health check failed, assuming server is up anyway:", error);
        clearTimeout(timeoutId);
        setServerReady(true);
      }
    };

    wakeServer();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleVoiceCommand = () => {
    setChatbotOpen(true);
    setInitialChatbotMessage("Listening for your command..."); 
  };
  
  const { isListening, startListening, stopListening, isSpeechSupported } = useVoiceAssistant({
    onCommand: handleVoiceCommand,
  });

  if (!serverReady && showWakeMessage) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6', textAlign: 'center', padding: '20px' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #ccc', borderTopColor: '#4CAF50', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <h2 style={{ color: '#333' }}>Waking up the server...</h2>
        <p style={{ color: '#666', maxWidth: '400px' }}>Since we are using a free hosting tier, the server goes to sleep after inactivity. It usually takes about <strong>50 seconds</strong> to wake up. Please hang tight!</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // If not ready but showWakeMessage is false, return null (blank) to avoid flash of content
  if (!serverReady) return null;

  return (
    <div className="app-wrapper">
      <Navbar 
        isListening={isListening} 
        startListening={startListening} 
        stopListening={stopListening}
        isSpeechSupported={isSpeechSupported}
        openChatbot={() => setChatbotOpen(true)}
      />
      <main>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/officer-progress" element={<OfficerProgress />} /> 
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['Citizen']} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportIssue />} />
            <Route path="/citizen/profile" element={<Profile />} />
            <Route path="/citizen/rewards" element={<Rewards />} />
            <Route path="/citizen/notifications" element={<Notifications />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Worker']} />}>
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/directions" element={<Directions />} />
            <Route path="/worker/new-complaint" element={<NewComplaint />} />
            <Route path="/worker/resolutions" element={<Resolutions />} />
            <Route path="/worker/navigation" element={<WorkerNavigation />} />
            <Route path="/worker/notifications" element={<WorkerNotifications />} />
            <Route path="/worker/profile" element={<WorkerProfile />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Officer']} />}>
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/manage-workers" element={<WorkerManagement />} />
            <Route path="/officer/complaints" element={<ComplaintManagement />} />
            <Route path="/officer/create-notification" element={<CreateNotification />} />
            <Route path="/officer/update-bin" element={<UpdateBin />} />
            <Route path="/officer/profile" element={<OfficerProfile />} />
            <Route path="/officer/worker-progress" element={<WorkerProgress />} />
          </Route>
        </Routes>
      </main>
      
      {user && (
        <Chatbot 
          isOpen={chatbotOpen} 
          setIsOpen={setChatbotOpen} 
          initialMessage={initialChatbotMessage}
          clearInitialMessage={() => setInitialChatbotMessage('')}
        />
      )}
      <Footer />
    </div>
  );
}

export default App;
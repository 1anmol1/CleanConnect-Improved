import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import OfficerProgress from './pages/Public/OfficerProgress/OfficerProgress.jsx'; // <-- Import the new public page

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

  const handleVoiceCommand = () => {
    setChatbotOpen(true);
    setInitialChatbotMessage("Listening for your command..."); 
  };
  
  const { isListening, startListening, stopListening, isSpeechSupported } = useVoiceAssistant({
    onCommand: handleVoiceCommand,
  });

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
          <Route path="/officer-progress" element={<OfficerProgress />} /> {/* <-- ADD THIS NEW PUBLIC ROUTE */}

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
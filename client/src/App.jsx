import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

// --- LAYOUT & CORE COMPONENTS ---
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Chatbot from './components/Chatbot/Chatbot.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// --- PUBLIC PAGES ---
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';

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
import WorkerNavigation from './pages/Worker/WorkerNavigation/WorkerNavigation.jsx'; // The new navigation page

// --- OFFICER PORTAL PAGES ---
import OfficerDashboard from './pages/Officer/Dashboard/OfficerDashboard.jsx';
import WorkerManagement from './pages/Officer/WorkerManagement/WorkerManagement.jsx';
import UpdateBin from './pages/Officer/UpdateBin/UpdateBin.jsx';
import OfficerProfile from './pages/Officer/Profile/OfficerProfile.jsx';
import ComplaintManagement from './pages/Officer/ComplaintManagement/ComplaintManagement.jsx';
import CreateNotification from './pages/Officer/CreateNotification/CreateNotification.jsx';

function App() {
  const { user } = useAuth();

  return (
    <div className="app-wrapper">
      <Navbar />
      <main>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* ================= PROTECTED CITIZEN ROUTES ================= */}
          <Route element={<ProtectedRoute allowedRoles={['Citizen']} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportIssue />} />
            <Route path="/citizen/profile" element={<Profile />} />
            <Route path="/citizen/rewards" element={<Rewards />} />
            <Route path="/citizen/notifications" element={<Notifications />} />
          </Route>

          {/* ================= PROTECTED WORKER ROUTES ================= */}
          <Route element={<ProtectedRoute allowedRoles={['Worker']} />}>
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/directions" element={<Directions />} />
            <Route path="/worker/new-complaint" element={<NewComplaint />} />
            <Route path="/worker/resolutions" element={<Resolutions />} />
            {/* THE NEW ROUTE FOR LIVE NAVIGATION */}
            <Route path="/worker/navigation" element={<WorkerNavigation />} />
            <Route path="/worker/notifications" element={<WorkerNotifications />} />
            <Route path="/worker/profile" element={<WorkerProfile />} />
          </Route>

          {/* ================= PROTECTED OFFICER ROUTES ================= */}
          <Route element={<ProtectedRoute allowedRoles={['Officer']} />}>
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/manage-workers" element={<WorkerManagement />} />
            <Route path="/officer/complaints" element={<ComplaintManagement />} />
            <Route path="/officer/create-notification" element={<CreateNotification />} />
            <Route path="/officer/update-bin" element={<UpdateBin />} />
            <Route path="/officer/profile" element={<OfficerProfile />} />
          </Route>
        </Routes>
      </main>
      {user && <Chatbot />}
      <Footer />
    </div>
  );
}

export default App;

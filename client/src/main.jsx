import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';

// Set the base URL for all Axios requests
// In development, this relies on the proxy in vite.config.js if VITE_API_URL is not set
// In production, you must set VITE_API_URL in Vercel to your Render backend URL
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return '/api';
  return 'https://cleanconnect-new-1cleanconnect-backend.onrender.com/api';
};

axios.defaults.baseURL = getBaseUrl();

ReactDOM.createRoot(document.getElementById('root')).render(
  // THE FIX: The <React.StrictMode> tags have been removed to prevent the
  // QR scanner library from crashing in development mode.
  <Router>
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ top: "90px" }}
      />
    </AuthProvider>
  </Router>
);
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create the Context
// This creates a shared data store that components can subscribe to.
export const AuthContext = createContext(null);

// 2. Create the Provider Component
// This component will wrap your entire application and manage the auth state.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // On initial application load, this effect checks if a user session
  // already exists in the browser's local storage.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); // The empty array [] means this runs only once when the app starts.

  /**
   * The central login function.
   * It saves the user's data and token, updates the state to notify all
   * components, and makes the user officially "logged in".
   * @param {object} authData - The data received from the backend (includes user object and token).
   */
  const login = (authData) => {
    localStorage.setItem('user', JSON.stringify(authData.user));
    localStorage.setItem('token', authData.token);
    setUser(authData.user); // This state update is what instantly notifies all components.
  };

  /**
   * The central logout function.
   * It clears the user's data from state and local storage, making them
   * officially "logged out", and redirects them to the login page.
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null); // This state update notifies all components that the user is gone.
    navigate('/login');
  };

  // The value object contains all the data and functions that will be
  // available to any component inside this provider.
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

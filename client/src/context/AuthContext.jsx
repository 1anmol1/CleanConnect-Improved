import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 1. Add loading state, true by default
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // If parsing fails, treat as logged out
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      // 2. Set loading to false after the check is complete
      setLoading(false);
    }
  }, []);

  const login = (authData) => {
    localStorage.setItem('user', JSON.stringify(authData.user));
    localStorage.setItem('token', authData.token);
    setUser(authData.user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // 3. Share the loading state with the rest of the app
  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
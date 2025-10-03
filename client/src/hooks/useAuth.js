import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import the context

// This hook is now just a convenient shortcut to access the shared auth context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
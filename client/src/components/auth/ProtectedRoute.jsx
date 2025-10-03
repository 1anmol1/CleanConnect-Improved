import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Read directly from localStorage for an immediate check
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  // Check if user is logged in
  if (!token || !userString) {
    // If not, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, parse the user data
  const user = JSON.parse(userString);

  // Check if the user's role is allowed to access this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If their role is not allowed, redirect them to a default page (e.g., their own dashboard)
    // This prevents a citizen from accessing an officer's page, for example.
    const userRole = user.role.toLowerCase();
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  // If the user is authenticated and authorized, render the page
  return <Outlet />;
};

export default ProtectedRoute;
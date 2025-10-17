import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../Loader/Loader'; // We'll show a loader while checking auth

const ProtectedRoute = ({ allowedRoles }) => {
  // Get the user object AND the new 'loading' state from the context
  const { user, loading } = useAuth();

  // 1. If the auth check is still in progress, show a loader and wait.
  //    This is the key to preventing the premature redirect.
  if (loading) {
    return <Loader text="Verifying authentication..." />;
  }

  // 2. After loading is complete, if there is no user, redirect to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If there is a user, check if their role is allowed for this route.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, send them to their default dashboard.
    const homePath = `/${user.role.toLowerCase()}/dashboard`;
    return <Navigate to={homePath} replace />;
  }

  // 4. If all checks pass, show the requested page.
  return <Outlet />;
};

export default ProtectedRoute;      
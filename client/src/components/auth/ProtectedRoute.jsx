import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Ensure this path is correct for your project
import Loader from '../Loader/Loader'; // We will show a loader for a better user experience

const ProtectedRoute = ({ allowedRoles }) => {
  // 1. Get the user object AND the crucial 'loading' state from your AuthContext.
  const { user, loading } = useAuth();

  // 2. THE FIRST FIX: While the AuthContext is checking for a user (on page load or after login),
  //    we will show a full-page loader. This is the most important step to prevent the race condition.
  //    The guard now waits until the "verification is complete" signal is given.
  if (loading) {
    return <Loader text="Verifying authentication..." />;
  }

  // 3. After the check is complete, if there is absolutely NO user,
  //    we redirect to the login page. This handles the "not authenticated" case.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 4. This is the authorization check. It runs only after we know loading is done and a user exists.
  //    It checks if the user's role is allowed to access this specific route.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    // --- THE SECOND, CRITICAL FIX IS HERE ---
    // A. We use optional chaining ('?.') to safely access 'user.role'. If 'user' exists but 'role'
    //    doesn't for some reason, this will result in 'undefined' instead of a crash.
    const userRole = user?.role?.toLowerCase();

    // B. We add a fallback. If for some reason we can't determine the user's role,
    //    we will redirect them to the home page ('/') as a safe default.
    const homePath = userRole ? `/${userRole}/dashboard` : '/';
    
    return <Navigate to={homePath} replace />;
  }

  // 5. If all checks pass, the user is both authenticated and authorized. Render the requested page.
  return <Outlet />;
};

export default ProtectedRoute;
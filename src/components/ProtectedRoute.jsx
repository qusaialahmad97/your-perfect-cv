import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // While the auth state is being determined, don't render anything.
  // The AuthProvider already handles this, but it's good practice for safety.
  if (loading) {
    return null; // Or a loading spinner
  }

  // If authenticated, render the nested child routes.
  // If not, redirect the user to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
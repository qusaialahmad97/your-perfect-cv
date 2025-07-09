// src/components/common/ProtectedRoute.jsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Spinner = () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the initial auth check is done AND there is no user, redirect to login.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]); // This effect runs whenever the auth state changes

  // While the auth check is running, show a full-page loading spinner.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  // If the check is done AND there is a user, render the actual page content.
  if (user) {
    return <>{children}</>;
  }

  // This is a fallback, in case the redirect hasn't happened yet.
  // It prevents a brief flash of the page content.
  return null;
};

export default ProtectedRoute;
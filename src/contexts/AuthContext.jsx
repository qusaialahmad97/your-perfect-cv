"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase';

// Create the context with a default shape for better auto-completion and safety
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  logout: async () => {},
});

// The custom hook to easily use the context in other components
export const useAuth = () => {
  return useContext(AuthContext);
};

// The Provider component that will wrap your application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener from Firebase handles all auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          id: firebaseUser.uid,

          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        // User is signed out
        setUser(null);
      }
      // This is crucial: set loading to false AFTER Firebase has determined the auth state
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    setUser(null);
    await firebaseSignOut(auth);
  };

  // The value that will be provided to all consuming components
  const value = {
    user,
    loading,
    logout,
    // This is a derived value: it's true only when loading is done AND a user exists.
    isAuthenticated: !loading && user !== null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
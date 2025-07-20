"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase'; // Make sure this path to your initialized firebase auth is correct

// --- FIX 1: Provide a better default shape for the context ---
// This helps with auto-completion and prevents errors if a component
// uses the context without a provider above it.
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    setUser(null);
    await firebaseSignOut(auth);
  };

  // --- FIX 2 (The Critical Fix): Add the derived isAuthenticated value ---
  // isAuthenticated is true ONLY when loading is finished AND the user object exists.
  // This is the value that the rest of your app needs.
  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !loading && user !== null 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase';

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
        // --- CHANGE: Add emailVerified to the user object ---
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified, // This is the crucial property
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

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !loading && user !== null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
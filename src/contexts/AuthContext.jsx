"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase'; // Make sure this path to your initialized firebase auth is correct

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // This 'loading' state is crucial. It's true until Firebase has confirmed the auth state.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is the Firebase listener for auth state changes.
    // It runs once on initial load and anytime the user signs in or out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in. We create a simplified user object for our context.
        setUser({
          id: firebaseUser.uid, // Use the Firebase UID as the user ID
          email: firebaseUser.email,
        });
      } else {
        // User is signed out.
        setUser(null);
      }
      // No matter the outcome, the initial authentication check is complete.
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // The empty array ensures this effect runs only once on mount.

  // We no longer need a `login` function here because `onAuthStateChanged` handles it.
  
  const logout = async () => {
    setUser(null); // Optimistically clear the user state
    await firebaseSignOut(auth);
  };

  const value = { user, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
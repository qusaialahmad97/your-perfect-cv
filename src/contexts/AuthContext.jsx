"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/firebase'; // Import 'db' from your firebase config
import { doc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener handles Firebase Auth state (logged in / out)
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // --- CHANGE: If user is logged in, set up a Firestore listener ---
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // onSnapshot listens for real-time changes to the user document
        const unsubscribeFirestore = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const firestoreData = doc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              // Add subscription data to our user object!
              subscriptionStatus: firestoreData.subscriptionStatus,
              paddleSubscriptionId: firestoreData.paddleSubscriptionId,
            });
          } else {
            // This case handles if a user exists in Auth but not Firestore
            setUser(null);
          }
          setLoading(false);
        });

        // Return the firestore unsubscriber to clean it up when the user logs out
        return unsubscribeFirestore;

      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener on component unmount
  }, []);
  
  const logout = async () => {
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
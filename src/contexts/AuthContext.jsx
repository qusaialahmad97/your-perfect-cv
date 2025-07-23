"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeFirestore = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const firestoreData = doc.data();
            // --- THIS IS THE FIX ---
            // We now read ALL the subscription fields from Firestore
            // and add them to the user object.
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              
              // Subscription data from Firestore
              subscriptionStatus: firestoreData.subscriptionStatus,
              paddleSubscriptionId: firestoreData.paddleSubscriptionId,
              planId: firestoreData.planId, // <-- ADDED THIS
              atsScansRemaining: firestoreData.atsScansRemaining, // <-- ADDED THIS
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return unsubscribeFirestore;

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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
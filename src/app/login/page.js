"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase';

const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>;

const LoginPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  // This effect handles redirecting users who are ALREADY logged in and verified.
  useEffect(() => {
    if (!loading && user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // *** THE CORE VERIFICATION CHECK ***
      // After a successful login, check if the user's email is verified.
      if (userCredential.user && !userCredential.user.emailVerified) {
        // If they are not verified, send them to the verification page to get instructions.
        // It's good UX to resend the email automatically in case they lost the first one.
        await sendEmailVerification(userCredential.user);
        router.push('/auth/verify-email');
        // We don't set loading to false here because we are navigating away.
        return; 
      }
      
      // If the user IS verified, the `useEffect` hook above will catch the state
      // change and redirect them to the dashboard automatically.

    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setMessage('Invalid credentials. Please check your email and password.');
      } else {
        setMessage('Login failed. Please try again.');
        console.error("Firebase Login Error:", err);
      }
      setIsLoading(false); // Set loading to false only if an error occurs.
    }
  };

  // Show a full-page loading indicator while the initial auth state is being determined
  // or if the user is already verified and is about to be redirected by the useEffect.
  if (loading || user?.emailVerified) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-300 flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Sign In'}
          </button>
        </div>
      </form>
      {message && (
        <p className="mt-4 text-center text-sm text-red-600">
          {message}
        </p>
      )}
      <p className="mt-6 text-center text-sm">
        Don't have an account?{' '}
        <Link href="/register" className="font-bold text-blue-500 hover:text-blue-800">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
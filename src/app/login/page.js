"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from "firebase/auth";
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

  useEffect(() => {
    if (!loading && user) {
      if (user.emailVerified) {
        router.push('/dashboard');
      } else {
        router.push('/auth/verify-email');
      }
    }
  }, [user, loading, router]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, the useEffect hook will handle the redirect.
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setMessage('Invalid credentials. Please check your email and password.');
      } else {
        setMessage('Login failed. Please try again.');
        console.error("Firebase Login Error:", err);
      }
      setIsLoading(false);
    }
  };

  if (loading || user) {
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
            autoComplete="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        {/* === START OF EDIT === */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-700 text-sm font-bold" htmlFor="password">
              Password
            </label>
            <Link
              href="/auth/reset-password" // NOTE: Ensure this path matches your file structure, e.g., /app/auth/reset-password/page.jsx
              className="text-sm font-medium text-blue-500 hover:text-blue-800"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        {/* === END OF EDIT === */}

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
"use client";

import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to check status

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth(); // Get user and loading state

  // --- ADD THIS EFFECT ---
  // This prevents an already logged-in user from seeing the register page.
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard'); // or any other appropriate page
    }
  }, [user, loading, router]);
  // --- END OF ADDITION ---

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const apiUrl = '/api/users/register'; 
      await axios.post(apiUrl, { email, password });
      
      // --- THE FIX ---
      // On successful registration, immediately redirect to the verify-email page.
      // Do not show a message or wait. The next page will have all the instructions.
      router.push('/auth/verify-email');
      // --- END OF FIX ---

    } catch (err) {
      setIsError(true);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Registration failed. Please try again.');
      }
      // Keep the user on the page to see the error message
      setIsLoading(false); 
    }
    // Note: We don't set loading to false in the success case because we are navigating away.
  };
  
  // Show a loading screen while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
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
            value={password}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
            minLength="6"
          />
        </div>
        <div className="flex items-center justify-between">
          <button 
            type="submit" 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-green-300"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Sign Up'}
          </button>
        </div>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
      <p className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-blue-500 hover:text-blue-800">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
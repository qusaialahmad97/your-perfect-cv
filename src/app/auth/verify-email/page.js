"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/firebase';

// This component contains the actual page content.
// It's separated to allow use of the `useSearchParams` hook.
const VerifyEmailContent = () => {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);

    // Check if the user came from the registration page
    const fromRegistration = searchParams.get('source') === 'register';

    useEffect(() => {
        // If auth is done loading and there's no user, redirect to login
        if (!loading && !user) {
            router.push('/login');
        }
        // If the user's email is already verified, redirect to the dashboard
        if (user?.emailVerified) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleResendVerification = async () => {
        if (!user) {
            setError("You are not logged in. Cannot send verification email.");
            return;
        }
        setIsResending(true);
        setError('');
        setMessage('');
        try {
            await sendEmailVerification(auth.currentUser);
            setMessage("A new verification email has been sent to your inbox.");
        } catch (err) {
            setError("Failed to send verification email. Please try again in a few minutes.");
            console.error("Resend verification error:", err);
        } finally {
            setIsResending(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold mb-4">
                    {fromRegistration ? 'Account Created Successfully!' : 'Verify Your Email Address'}
                </h2>
                <p className="text-gray-600 mb-6">
                    {fromRegistration 
                        ? "Thank you for registering! To complete the process, " 
                        : "To continue, "
                    }
                    a verification link has been sent to your email address: <strong>{user.email}</strong>.
                    <br/>
                    Please check your inbox (and spam folder) and click the link to activate your account.
                </p>

                {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={handleResendVerification} 
                        disabled={isResending} 
                        className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isResending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    <button 
                        onClick={logout} 
                        className="w-full sm:w-auto bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                    >
                        Log Out
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                    After verifying, you can close this page and log in.
                </p>
            </div>
        </div>
    );
};

// The main page component wraps the content in a Suspense boundary,
// which is required for components that use `useSearchParams`.
const VerifyEmailPage = () => {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
};

export default VerifyEmailPage;
"use client";

import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '@/firebase';
import Link from 'next/link';

const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>;

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('A password reset link has been sent to your email.');
            setEmail('');
        } catch (error) {
            setMessage('Failed to send reset email. Please check the email address and try again.');
            console.error('Password Reset Error:', error);
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
            <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>
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
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-300 flex justify-center items-center"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : 'Send Reset Link'}
                    </button>
                </div>
            </form>
            {message && (
                <p className={`mt-4 text-center text-sm ${message.includes('A password reset link') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
            <p className="mt-6 text-center text-sm">
                Remember your password?{' '}
                <Link href="/auth/login" className="font-bold text-blue-500 hover:text-blue-800">
                    Log in
                </Link>
            </p>
        </div>
    );
};

export default ResetPasswordPage;
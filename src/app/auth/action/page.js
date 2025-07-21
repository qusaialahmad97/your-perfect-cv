// src/app/auth/action/page.js

"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/firebase';
import Link from 'next/link';

const ActionHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const mode = searchParams.get('mode');
        const actionCode = searchParams.get('oobCode');

        if (mode !== 'verifyEmail' || !actionCode) {
            setStatus('error');
            setMessage('Invalid verification link. Please try registering again.');
            return;
        }

        const handleAction = async () => {
            try {
                // Verify the action code is valid.
                await checkActionCode(auth, actionCode);
                
                // Apply the action code to verify the user's email.
                await applyActionCode(auth, actionCode);
                
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in to your account.');

            } catch (error) {
                setStatus('error');
                if (error.code === 'auth/invalid-action-code') {
                    setMessage('This verification link has expired or has already been used. Please request a new one by trying to log in.');
                } else {
                    setMessage('An error occurred during verification. Please try again.');
                }
                console.error("Verification error:", error);
            }
        };

        handleAction();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {status === 'verifying' && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Verifying...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-green-600">Verification Successful!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link href="/login" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                            Proceed to Login
                        </Link>
                    </>
                )}
                {status === 'error' && (
                     <>
                        <h2 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link href="/register" className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
                            Go to Registration
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

// Wrap with Suspense because useSearchParams requires it.
const ActionPage = () => (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <ActionHandler />
    </Suspense>
);

export default ActionPage;
// src/app/auth/action/page.js

"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    applyActionCode, 
    checkActionCode, 
    verifyPasswordResetCode, 
    confirmPasswordReset 
} from 'firebase/auth';
import { auth } from '@/firebase';
import Link from 'next/link';

// A simple spinner component
const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>;

const ActionHandler = () => {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('loading'); // 'loading', 'verifyEmail', 'resetPassword', 'success', 'error'
    const [message, setMessage] = useState('Processing your request...');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [actionCode, setActionCode] = useState('');

    useEffect(() => {
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (!mode || !oobCode) {
            setStatus('error');
            setMessage('Invalid link. Required parameters are missing.');
            return;
        }

        setActionCode(oobCode);

        const handleAction = async () => {
            try {
                switch (mode) {
                    case 'verifyEmail':
                        await handleVerifyEmail(oobCode);
                        break;
                    case 'resetPassword':
                        await handleResetPassword(oobCode);
                        break;
                    default:
                        setStatus('error');
                        setMessage('Unsupported action. The link is invalid.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(getFirebaseErrorMessage(error));
                console.error("Action handler error:", error);
            }
        };

        handleAction();
    }, [searchParams]);

    const getFirebaseErrorMessage = (error) => {
        switch (error.code) {
            case 'auth/expired-action-code':
                return 'This link has expired. Please request a new one.';
            case 'auth/invalid-action-code':
                return 'This link is invalid or has already been used. Please request a new one.';
            case 'auth/user-disabled':
                return 'Your account has been disabled.';
            case 'auth/user-not-found':
                 return 'No user found corresponding to this link.';
            case 'auth/weak-password':
                return 'The new password is too weak. Please choose a stronger password.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    const handleVerifyEmail = async (code) => {
        await applyActionCode(auth, code);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in to your account.');
    };

    const handleResetPassword = async (code) => {
        // Just verify the code first. This confirms the link is valid before showing the form.
        await verifyPasswordResetCode(auth, code);
        setStatus('resetPassword'); // Change status to show the password reset form
        setMessage('Please enter your new password.');
    };

    const handlePasswordResetSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setMessage('Passwords do not match. Please try again.');
            setStatus('error'); // Temporarily show an error message
            // A better UX would be an inline error, but this works for simplicity
            setTimeout(() => {
                setStatus('resetPassword');
                setMessage('Please enter your new password.');
            }, 3000);
            return;
        }

        try {
            await confirmPasswordReset(auth, actionCode, newPassword);
            setStatus('success');
            setMessage('Your password has been successfully changed! You can now log in with your new password.');
        } catch (error) {
            setStatus('error');
            setMessage(getFirebaseErrorMessage(error));
            console.error("Password reset confirmation error:", error);
        }
    };
    
    // RENDER LOGIC
    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Processing...</h2>
                        <Spinner />
                        <p className="mt-4 text-gray-600">{message}</p>
                    </>
                );
            case 'resetPassword':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <form onSubmit={handlePasswordResetSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2 text-left" htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                             <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2 text-left" htmlFor="confirmNewPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                Change Password
                            </button>
                        </form>
                    </>
                );
            case 'success':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-green-600">Success!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link href="/auth/login" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                            Proceed to Login
                        </Link>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-red-600">Action Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link href="/register" className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
                            Go to Registration
                        </Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {renderContent()}
            </div>
        </div>
    );
};

// Wrap with Suspense because useSearchParams requires it.
const ActionPage = () => (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
        <ActionHandler />
    </Suspense>
);

export default ActionPage;
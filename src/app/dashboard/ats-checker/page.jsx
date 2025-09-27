// app/dashboard/ats-checker/page.jsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAtsAnalysis } from '@/hooks/useAtsAnalysis';
import ATSResult from '@/components/ats/ATSResult';
import { AnalysisForm } from '@/components/ats/AnalysisForm';
import LoadingSpinner from '@/components/ats/LoadingSpinner'; // Make sure this component exists

const ATSCheckerPage = () => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    // All complex logic is neatly contained in our custom hook
    const { isLoading, loadingMessage, error, analysisResult, runAnalysis, resetAnalysis } = useAtsAnalysis();
    
    // Protection logic to ensure user is authenticated and has scans/pro plan
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || !user?.emailVerified) {
                router.push('/login');
                return;
            }
            const isPro = user?.subscriptionStatus === 'active' && user?.planId?.startsWith('pro');
            const hasScans = user?.atsScansRemaining > 0;
            if (!isPro && !hasScans) {
                router.push('/pricing');
            }
        }
    }, [user, authLoading, isAuthenticated, router]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800">Premium ATS & Career Co-Pilot</h1>
                <p className="mt-2 text-lg text-gray-600">Get a deterministic, transparent score and strategic insights to land your next interview.</p>
                <div className="mt-4">
                    <button onClick={() => router.push('/dashboard/ats-history')} className="font-semibold text-blue-600 hover:text-blue-800 transition">
                        View My Scan History →
                    </button>
                </div>
            </header>

            <main>
                {/* Conditional rendering based on the hook's state */}
                {isLoading && (
                    <div className="flex justify-center my-12">
                        <LoadingSpinner message={loadingMessage} />
                    </div>
                )}
                
                {!isLoading && analysisResult && (
                    <ATSResult result={analysisResult} onReset={resetAnalysis} />
                )}
                
                {!isLoading && !analysisResult && (
                    <AnalysisForm onAnalysisSubmit={runAnalysis} isProcessing={isLoading} />
                )}

                {/* Display a global error message if one occurs during analysis */}
                {error && !isLoading && (
                    <div className="mt-6 max-w-2xl mx-auto bg-red-100 text-red-800 p-4 rounded-lg text-center" role="alert">
                        <p className="font-semibold">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ATSCheckerPage;
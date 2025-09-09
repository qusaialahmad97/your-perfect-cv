"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ATSResult from '@/components/ats/ATSResult';
import { aiService } from '@/services/aiService';

// --- Import Firestore functions for Scan History ---
import { db } from '@/firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

const LoadingSpinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">{message}</p>
        <p className="text-sm text-gray-500">This may take up to 45 seconds for deep analysis...</p>
    </div>
);

const ATSCheckerPage = () => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    const [cvFile, setCvFile] = useState(null);
    const [cvText, setCvText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Analyzing...');
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [clientSideGetTextFromPdf, setClientSideGetTextFromPdf] = useState(null);

    // Protection Logic & PDF Parser Loading (No changes needed here)
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || !user?.emailVerified) { router.push('/login'); return; }
            const isPro = user?.subscriptionStatus === 'active' && user?.planId?.startsWith('pro');
            const hasScans = user?.atsScansRemaining > 0;
            if (!isPro && !hasScans) { router.push('/pricing'); }
        }
    }, [user, authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('@/utils/parsePdf')
                .then(mod => setClientSideGetTextFromPdf(() => mod.getTextFromPdf))
                .catch(err => {
                    console.error("Error loading PDF parser module:", err);
                    setError("Failed to load PDF processing capabilities.");
                });
        }
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCvFile(file);
        setIsLoading(true);
        setLoadingMessage('Reading your CV...');
        setError('');
        try {
            const text = await clientSideGetTextFromPdf(file);
            setCvText(text);
        } catch (err) {
            setError(`Error processing PDF: ${err.message}`);
            setCvFile(null);
            setCvText('');
        } finally {
            setIsLoading(false);
        }
    };

    // --- PREMIUM FEATURE: Save scan results to Firestore ---
    const saveScanToFirestore = async (resultData, jobDesc, cvFileName) => {
        if (!user || !user.uid) {
            console.error("User not available for saving scan.");
            return;
        }
        try {
            const scanDocRef = doc(collection(db, 'users', user.uid, 'atsScans'));
            const jobTitleSnippet = jobDesc.substring(0, 100).split('\n')[0] || 'Untitled Job';
            await setDoc(scanDocRef, {
                scanId: scanDocRef.id,
                overallScore: resultData.overallScore || 0,
                jobTitleSnippet: jobTitleSnippet,
                cvFileName: cvFileName,
                createdAt: serverTimestamp(),
                fullResult: resultData,
            });
            console.log("Scan saved successfully to user's history!");
        } catch (error) {
            console.error("Error saving scan to Firestore:", error);
        }
    };

    const handleAnalysis = async () => {
        if (!cvText || !jobDescription) {
            setError('Please upload a CV and provide a job description.');
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Initializing AI Coach...');
        setError('');
        setAnalysisResult(null);

        // --- ENHANCED & BULLETPROOF PROMPT ---
        const prompt = `
          Act as an elite AI career coach and a hyper-critical Applicant Tracking System (ATS). Analyze the provided CV against the Job Description.

          CV Text:
          ---
          ${cvText}
          ---

          Job Description:
          ---
          ${jobDescription}
          ---

          --- IMPORTANT FINAL INSTRUCTION ---
          Your response MUST be a single, minified JSON object with NO extra text or formatting.
          
          **If successful**, return a JSON with "analysisStatus": "success" and the following data structure. When rewriting bullet points, you MUST convert vague statements into strong, quantifiable achievements.
          {
            "analysisStatus": "success",
            "overallScore": <integer>,
            "recruiterFeedback": "<string>",
            "scoreBreakdown": { "keywordMatch": <integer>, "relevance": <integer>, "impact": <integer>, "formatting": <integer> },
            "keywordAnalysis": {
              "technical": { "matched": ["<string>"], "missing": [ { "skill": "<string>", "explanation": "<string, briefly explain why this skill is important for the role>" } ] },
              "softSkills": { "matched": ["<string>"], "missing": [ { "skill": "<string>", "explanation": "<string>" } ] }
            },
            "contentFeedback": [
              { "category": "<string>", "originalText": "<string>", "recommendation": "<string>", "suggestedRewrite": "<string>" }
            ],
            "coverLetterTalkingPoints": [
                "<string, a powerful opening sentence for a cover letter>",
                "<string, a sentence connecting a key CV achievement to a job requirement>",
                "<string, a sentence highlighting a key technical or soft skill that matches the job description>"
            ],
            "finalSummary": "<string>"
          }

          **If you CANNOT perform the analysis** (e.g., content policy, unclear input), you MUST return a JSON with "analysisStatus": "error".
          {
            "analysisStatus": "error",
            "errorMessage": "<string, a brief, user-friendly explanation of the failure (e.g., 'The CV or job description may contain sensitive content. Please review and try again.')>"
          }
        `;

        let responseText = '';
        try {
            setLoadingMessage('Comparing CV to Job Description...');
            responseText = await aiService.callAI(prompt, 0.5);
            setLoadingMessage('Generating Strategic Feedback...');
            
            const firstBraceIndex = responseText.indexOf('{');
            const lastBraceIndex = responseText.lastIndexOf('}');

            if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex < firstBraceIndex) {
                throw new Error("The AI response was malformed and did not contain a JSON object.");
            }
            
            const jsonString = responseText.substring(firstBraceIndex, lastBraceIndex + 1);
            const parsedJson = JSON.parse(jsonString);

            if (parsedJson.analysisStatus === 'error') {
                throw new Error(parsedJson.errorMessage || "The AI reported an unspecified error.");
            } else if (parsedJson.analysisStatus === 'success') {
                setAnalysisResult(parsedJson);
                await saveScanToFirestore(parsedJson, jobDescription, cvFile.name);
            } else {
                throw new Error("The AI response was in an unexpected format.");
            }

        } catch (err) {
            console.error("RAW AI Response causing error:", responseText);
            setError(`Analysis failed. ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setAnalysisResult(null);
        setCvFile(null);
        setCvText('');
        setError('');
    };

    const isPro = user?.subscriptionStatus === 'active' && user?.planId?.startsWith('pro');
    const hasScans = user?.atsScansRemaining > 0;
    
    if (authLoading) { /* ... loading indicator ... */ }
    
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-800">Premium ATS & Career Co-Pilot</h1>
                <p className="mt-2 text-lg text-gray-600">Get strategic insights, track your progress, and land your next interview.</p>
            </div>
            {/* --- PREMIUM FEATURE: Link to Scan History --- */}
            <div className="text-center mb-10">
                 <button onClick={() => router.push('/dashboard/ats-history')} className="font-semibold text-blue-600 hover:text-blue-800 transition">
                    View My Scan History →
                </button>
            </div>

            {isLoading && ( <div className="flex justify-center my-12"><LoadingSpinner message={loadingMessage} /></div> )}
            
            {!isLoading && analysisResult && ( <ATSResult result={analysisResult} onReset={handleReset} /> )}
            
            {!isLoading && !analysisResult && (
                <>
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        {/* CV UPLOAD CARD */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border h-full flex flex-col">
                            <h2 className="text-2xl font-bold mb-1 text-gray-800">1. Upload Your CV</h2>
                            <p className="text-sm text-gray-500 mb-4">We'll extract the text to analyze. Only PDF is supported.</p>
                            <div className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col justify-center">
                                <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-semibold hover:underline">
                                    {cvFile ? `Selected: ${cvFile.name}` : 'Choose a PDF file to upload'}
                                </label>
                            </div>
                            {cvText && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">✅ CV text extracted successfully.</div>}
                        </div>
                        {/* JOB DESCRIPTION CARD */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border h-full flex flex-col">
                            <h2 className="text-2xl font-bold mb-1 text-gray-800">2. Paste Job Description</h2>
                            <p className="text-sm text-gray-500 mb-4">Paste the entire job description for the best results.</p>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                rows="10"
                                placeholder="Paste the full job description here..."
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 flex-grow"
                            />
                        </div>
                    </div>
                    {error && <div className="mt-6 bg-red-100 text-red-700 p-3 rounded-md" role="alert">{error}</div>}
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleAnalysis}
                            disabled={!cvFile || !jobDescription}
                            className="bg-green-600 text-white font-bold py-3 px-12 text-lg rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            Analyze My CV
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ATSCheckerPage;
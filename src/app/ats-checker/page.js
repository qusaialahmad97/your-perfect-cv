"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ATSResult from '@/components/ats/ATSResult';
import { aiService } from '@/services/aiService';

const ATSCheckerPage = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [cvFile, setCvFile] = useState(null);
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [clientSideGetTextFromPdf, setClientSideGetTextFromPdf] = useState(null);

  // Protection Logic: Redirects non-subscribers
  useEffect(() => {
    if (!authLoading) {
      const isPro = user?.subscriptionStatus === 'active' && user?.planId?.startsWith('pro');
      const hasScans = user?.atsScansRemaining > 0;
      if (!isAuthenticated || !user?.emailVerified || (!isPro && !hasScans)) {
        router.push('/pricing');
      }
    }
  }, [user, authLoading, isAuthenticated, router]);

  // Dynamically load the PDF parsing utility on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/utils/parsePdf')
        .then(mod => {
          if (mod && mod.getTextFromPdf) {
            setClientSideGetTextFromPdf(() => mod.getTextFromPdf);
          } else {
            console.error("Failed to find getTextFromPdf in module.");
            setError("Initialization error: PDF parser function not found.");
          }
        })
        .catch(err => {
          console.error("Error loading PDF parser module:", err);
          setError("Failed to load PDF processing capabilities. Please try reloading the page.");
        });
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!clientSideGetTextFromPdf) {
      setError('PDF processing module is still loading. Please wait a moment and try again.');
      return;
    }
    setCvFile(file);
    setIsLoading(true);
    setError('');
    try {
      const text = await clientSideGetTextFromPdf(file);
      setCvText(text);
    } catch (err) {
      setError(`Error processing PDF: ${err.message || 'An unknown error occurred.'}`);
      setCvFile(null);
      setCvText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysis = async () => {
    if (!cvText || !jobDescription) {
      setError('Please upload a CV and provide a job description.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    const prompt = `
      Act as an elite AI career coach and a hyper-critical Applicant Tracking System (ATS).
      Analyze the provided CV against the Job Description with extreme detail.

      Your response MUST be a single, minified JSON object with no extra text or formatting outside of it.
      The JSON object must adhere to this exact structure:
      {
        "overallScore": <integer>,
        "recruiterFeedback": "<string, a 15-second gut reaction a human recruiter would have. Be brutally honest about clarity and impact.>",
        "scoreBreakdown": { "keywordMatch": <integer>, "relevance": <integer>, "impact": <integer>, "formatting": <integer> },
        "experienceLevelAnalysis": { "level": "<'Good Match' or 'Overqualified' or 'Underqualified'>", "comment": "<string>" },
        "keywordAnalysis": {
          "technical": { "matched": ["<string>"], "missing": ["<string>"] },
          "softSkills": { "matched": ["<string>"], "missing": ["<string>"] }
        },
        "contentFeedback": [
          {
            "category": "<'Professional Summary' or 'Work Experience Bullet Point' or 'Skills Section'>",
            "originalText": "<string, the EXACT original sentence or bullet point from the CV>",
            "recommendation": "<string, explain WHY this is weak or could be improved (e.g., 'Uses passive language', 'Lacks quantifiable results').>",
            "suggestedRewrite": "<string, an AI-powered, impactful rewrite of the original text that incorporates action verbs and keywords.>"
          }
        ],
        "industryFeedback": {
          "isAppropriate": <boolean>,
          "comment": "<string, a comment on the CV's tone, language, and structure for the specific role (e.g., 'For a senior engineering role, the summary should focus more on architectural decisions and project leadership.')>"
        },
        "timelineAnalysis": {
          "hasGaps": <boolean>,
          "comment": "<string, if hasGaps is true, provide a comment and advice (e.g., 'There is a 9-month employment gap between 2021 and 2022. Be prepared to discuss this in an interview, focusing on any professional development or projects from that time.')>"
        },
        "interviewQuestions": [
          "<string, a likely interview question based on the CV and job description.>"
        ],
        "finalSummary": "<string, a concluding paragraph summarizing the key strengths and the #1 most important area to improve.>"
      }

      CV Text:
      ---
      ${cvText}
      ---

      Job Description:
      ---
      ${jobDescription}
      ---
    `;

    try {
      const responseText = await aiService.callAI(prompt, 0.5);
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleanedText);
      setAnalysisResult(parsedJson);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = user?.subscriptionStatus === 'active' && user?.planId?.startsWith('pro');
  const hasScans = user?.atsScansRemaining > 0;

  if (authLoading || (!isPro && !hasScans)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Verifying your access...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800">Premium ATS & Career Coach</h1>
        <p className="mt-2 text-lg text-gray-600">Go beyond a simple score. Get actionable insights to land your next interview.</p>
      </div>

      {!analysisResult ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h2 className="text-2xl font-bold mb-4">1. Upload Your CV</h2>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={!clientSideGetTextFromPdf} 
            />
            {cvFile && <p className="mt-3 text-sm text-green-600">✅ {cvFile.name} uploaded successfully.</p>}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h2 className="text-2xl font-bold mb-4">2. Paste Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows="8"
              placeholder="Paste the full job description here..."
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : null}

      {error && <div className="mt-6 bg-red-100 text-red-700 p-3 rounded-md" role="alert">{error}</div>}

      <div className="mt-8 text-center">
        {!analysisResult ? (
          <button
            onClick={handleAnalysis}
            disabled={isLoading || !cvFile || !jobDescription || !clientSideGetTextFromPdf}
            className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze My CV'}
          </button>
        ) : (
           <ATSResult 
              result={analysisResult} 
              onReset={() => setAnalysisResult(null)}
           />
        )}
      </div>
    </div>
  );
};

export default ATSCheckerPage;
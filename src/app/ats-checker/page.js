// src/pages/ATSCheckerPage.jsx
"use client"; // This page uses state and event handlers

import React, { useState } from 'react';
import { getTextFromPdf } from '@/utils/parsePdf';
import ATSResult from '@/components/ats/ATSResult';
import { aiService } from '@/services/aiService'; // <-- IMPORT THE AI SERVICE

const ATSCheckerPage = () => {
  const [cvFile, setCvFile] = useState(null);
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      setIsLoading(true);
      setError('');
      try {
        const text = await getTextFromPdf(file);
        setCvText(text);
      } catch (err) {
        setError(err.message);
        setCvFile(null);
        setCvText('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- REFACTORED TO USE aiService ---
  const handleAnalysis = async () => {
    if (!cvText || !jobDescription) {
      setError('Please upload a CV and provide a job description.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    const prompt = `
      Act as an expert ATS (Applicant Tracking System) and professional recruiter.
      Analyze the following CV against the provided Job Description.

      Provide a detailed analysis in a strict JSON format. Do not include any text outside of the JSON object.
      The JSON object must have these exact keys: "matchScore", "matchedKeywords", "missingKeywords", "summary".
      - "matchScore": An integer between 0 and 100 representing the compatibility.
      - "matchedKeywords": An array of strings listing key skills and qualifications from the job description that were found in the CV.
      - "missingKeywords": An array of strings listing key skills and qualifications from the job description that were NOT found in the CV.
      - "summary": A brief, professional paragraph explaining the score and providing actionable advice for the applicant to improve their CV for this specific role.

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
      // Use the centralized aiService to make the call
      const responseText = await aiService.callAI(prompt, 0.5); // Using the generic callAI method

      if (responseText) {
          const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          try {
            const parsedJson = JSON.parse(cleanedText);
            setAnalysisResult(parsedJson);
          } catch (parseError) {
            console.error("AI Response JSON Parse Error:", parseError, "--- Raw Text:", cleanedText);
            throw new Error("The AI returned an invalid format. Please try again.");
          }
      } else {
        throw new Error("No content in AI response.");
      }
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  // --- END OF REFACTOR ---

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800">ATS Score Checker</h1>
        <p className="mt-2 text-lg text-gray-600">See how your CV stacks up against a job description.</p>
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
            disabled={isLoading || !cvFile || !jobDescription}
            className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze My CV'}
          </button>
        ) : (
           <ATSResult result={analysisResult} onReset={() => setAnalysisResult(null)} />
        )}
      </div>
    </div>
  );
};

export default ATSCheckerPage;
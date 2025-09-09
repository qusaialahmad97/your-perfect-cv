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
        <p className="text-sm text-gray-500">This deep analysis may take up to 45 seconds...</p>
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

    // Protection Logic & PDF Parser Loading
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
                .catch(err => setError("Failed to load PDF processing capabilities."));
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
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- The "Brain": Deterministic Scoring Logic ---
    const calculateRealScore = (data) => {
        const weights = { hardSkills: 0.40, softSkills: 0.10, experience: 0.25, impact: 0.15, education: 0.10 };

        const jdHard = new Set(data.jdKeywords.hardSkills.map(k => k.toLowerCase().trim()));
        const cvHard = new Set(data.cvKeywords.hardSkills.map(k => k.toLowerCase().trim()));
        const matchedHard = [...cvHard].filter(k => jdHard.has(k));
        const hardSkillScore = jdHard.size > 0 ? (matchedHard.length / jdHard.size) * weights.hardSkills * 100 : weights.hardSkills * 100;

        const jdSoft = new Set(data.jdKeywords.softSkills.map(k => k.toLowerCase().trim()));
        const cvSoft = new Set(data.cvKeywords.softSkills.map(k => k.toLowerCase().trim()));
        const matchedSoft = [...cvSoft].filter(k => jdSoft.has(k));
        const softSkillScore = jdSoft.size > 0 ? (matchedSoft.length / jdSoft.size) * weights.softSkills * 100 : weights.softSkills * 100;

        let experienceScore = 0;
        if (data.jdRequirements.experienceYears > 0) {
            const ratio = data.cvQualifications.totalExperienceYears / data.jdRequirements.experienceYears;
            experienceScore = Math.min(1, ratio) * weights.experience * 100;
        } else {
            experienceScore = weights.experience * 100;
        }

        const actionVerbRatio = Math.min(1, (data.impactMetrics.actionVerbCount || 0) / 5);
        const quantifiedResultRatio = Math.min(1, (data.impactMetrics.quantifiedResultsCount || 0) / 3);
        const impactScore = ((actionVerbRatio * 0.5) + (quantifiedResultRatio * 0.5)) * weights.impact * 100;

        const eduLevels = { 'Any': 0, 'High School': 1, 'Bachelors': 2, 'Masters': 3, 'PhD': 4 };
        const cvEdu = eduLevels[data.cvQualifications.highestEducation] || 0;
        const jdEdu = eduLevels[data.jdRequirements.educationLevel] || 0;
        const educationScore = cvEdu >= jdEdu ? weights.education * 100 : 0;

        const totalScore = Math.ceil(hardSkillScore + softSkillScore + experienceScore + impactScore + educationScore);

        return {
            overallScore: Math.min(100, totalScore),
            scoreBreakdown: {
                hardSkills: { score: Math.ceil(hardSkillScore), weight: weights.hardSkills * 100, matched: matchedHard, missing: [...jdHard].filter(k => !cvHard.has(k)) },
                softSkills: { score: Math.ceil(softSkillScore), weight: weights.softSkills * 100, matched: matchedSoft, missing: [...jdSoft].filter(k => !cvSoft.has(k)) },
                experience: { score: Math.ceil(experienceScore), weight: weights.experience * 100, required: data.jdRequirements.experienceYears, found: data.cvQualifications.totalExperienceYears },
                impact: { score: Math.ceil(impactScore), weight: weights.impact * 100, actionVerbs: data.impactMetrics.actionVerbCount, quantifiedResults: data.impactMetrics.quantifiedResultsCount },
                education: { score: Math.ceil(educationScore), weight: weights.education * 100, required: data.jdRequirements.educationLevel, found: data.cvQualifications.highestEducation }
            }
        };
    };

    const saveScanToFirestore = async (resultData, jobDesc, cvFileName) => {
        if (!user || !user.uid) return;
        try {
            const scanDocRef = doc(collection(db, 'users', user.uid, 'atsScans'));
            const jobTitleSnippet = jobDesc.substring(0, 100).split('\n')[0] || 'Untitled Job';
            await setDoc(scanDocRef, {
                scanId: scanDocRef.id,
                overallScore: resultData.overallScore,
                jobTitleSnippet,
                cvFileName,
                createdAt: serverTimestamp(),
                fullResult: resultData,
            });
        } catch (error) {
            console.error("Error saving scan to Firestore:", error);
        }
    };

    const handleAnalysis = async () => {
        if (!cvText || !jobDescription) return;
        setIsLoading(true);
        setLoadingMessage('Initializing AI Data Analyst...');
        setError('');
        setAnalysisResult(null);

        const prompt = `Act as a senior technical recruiter and data analyst. Your task is to extract specific, structured data by comparing the provided CV and Job Description (JD). Your response MUST be a single, minified JSON object with NO extra text or formatting.
        CV Text: --- ${cvText} ---
        Job Description: --- ${jobDescription} ---
        
        **If successful**, return a JSON with "analysisStatus": "success" and the following data structure:
        { "analysisStatus": "success", "extractedData": { "jdKeywords": { "hardSkills": ["<list of ALL technical skills, tools, and platforms mentioned in the JD>"], "softSkills": ["<list of ALL soft skills and qualifications in the JD>"] }, "cvKeywords": { "hardSkills": ["<list of ALL technical skills, tools, and platforms in the CV>"], "softSkills": ["<list of ALL soft skills in the CV>"] }, "jdRequirements": { "experienceYears": <integer, years required or 0>, "educationLevel": "<'Bachelors' or 'Masters' or 'PhD' or 'Any'>" }, "cvQualifications": { "totalExperienceYears": <integer, total years experience from CV>, "highestEducation": "<'Bachelors' or 'Masters' or 'PhD' or 'High School'>" }, "impactMetrics": { "actionVerbCount": <integer, count of strong action verbs like 'Led', 'Architected', 'Increased'>, "quantifiedResultsCount": <integer, count of bullet points with numbers, %, or $> }, "jobTimeline": [ { "role": "<string>", "company": "<string>", "startDate": "<YYYY-MM>", "endDate": "<YYYY-MM or 'Present'>" } ] }, "qualitativeFeedback": { "recruiterGutReaction": "<string, 15-second human recruiter gut reaction>", "toneAndIndustryFit": "<string, comment on CV tone>", "finalSummary": "<string, concluding paragraph>", "suggestedInterviewQuestions": ["<string>"] } }
        
        **If you CANNOT perform the analysis**, return a JSON with "analysisStatus": "error":
        { "analysisStatus": "error", "errorMessage": "<string, a user-friendly explanation of the failure.>" }`;
        
        let responseText = '';
        try {
            setLoadingMessage('Extracting Key Data from JD & CV...');
            responseText = await aiService.callAI(prompt, 0.5);
            setLoadingMessage('Calculating Deterministic Score...');
            
            const firstBraceIndex = responseText.indexOf('{');
            const lastBraceIndex = responseText.lastIndexOf('}');
            if (firstBraceIndex === -1 || lastBraceIndex === -1) throw new Error("AI response was malformed.");
            
            const jsonString = responseText.substring(firstBraceIndex, lastBraceIndex + 1);
            const parsedJson = JSON.parse(jsonString);

            if (parsedJson.analysisStatus === 'error') throw new Error(parsedJson.errorMessage);
            
            if (parsedJson.analysisStatus === 'success') {
                const scoreData = calculateRealScore(parsedJson.extractedData);
                const finalResult = { ...scoreData, qualitativeFeedback: parsedJson.qualitativeFeedback, timeline: parsedJson.extractedData.jobTimeline };
                setAnalysisResult(finalResult);
                await saveScanToFirestore(finalResult, jobDescription, cvFile.name);
            } else {
                throw new Error("AI response had an unexpected format.");
            }
        } catch (err) {
            console.error("RAW AI Response:", responseText);
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
        // Optionally keep the job description
        // setJobDescription('');
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-800">Premium ATS & Career Co-Pilot</h1>
                <p className="mt-2 text-lg text-gray-600">Get a deterministic, transparent score and strategic insights to land your next interview.</p>
            </div>
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
                        <button onClick={handleAnalysis} disabled={!cvFile || !jobDescription} className="bg-green-600 text-white font-bold py-3 px-12 text-lg rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                            Get My Score
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ATSCheckerPage;
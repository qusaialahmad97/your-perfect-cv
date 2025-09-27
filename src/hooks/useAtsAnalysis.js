// src/hooks/useAtsAnalysis.js
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
import { db } from '@/firebase';
import { doc, setDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// This helper function robustly extracts a JSON object from a string and provides a clear error if it fails.
const extractJsonFromString = (str) => {
    if (!str || typeof str !== 'string') {
        throw new Error("AI returned an empty or invalid response.");
    }
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        // The error now includes the AI's actual (non-JSON) response for better debugging.
        throw new Error(`Could not find a valid JSON object in the AI response. The AI said: "${str}"`);
    }
    return str.substring(firstBrace, lastBrace + 1);
};

// This function performs the deterministic scoring with intelligent, "fuzzy" matching for keywords.
const calculateRealScore = (data) => {
    const weights = { hardSkills: 0.40, softSkills: 0.10, experience: 0.25, impact: 0.15, education: 0.10 };

    // --- Intelligent Keyword Matching Logic ---
    const getMatches = (jdKeywordsRaw, cvKeywordsRaw) => {
        const jdKeywords = (jdKeywordsRaw || []).map(k => k.toLowerCase().trim()).filter(Boolean);
        const cvKeywords = (cvKeywordsRaw || []).map(k => k.toLowerCase().trim()).filter(Boolean);

        const matched = new Set();
        const missing = new Set();

        for (const jdKw of jdKeywords) {
            let foundMatch = false;
            // A simple way to handle plurals, e.g., "report" vs "reports"
            const jdKwSingular = jdKw.endsWith('s') ? jdKw.slice(0, -1) : jdKw;
            const jdKwPlural = jdKw.endsWith('s') ? jdKw : jdKw + 's';

            for (const cvKw of cvKeywords) {
                const cvKwSingular = cvKw.endsWith('s') ? cvKw.slice(0, -1) : cvKw;
                
                // Condition 1: Exact match or simple plural match
                if (jdKw === cvKw || jdKwSingular === cvKwSingular) {
                    foundMatch = true;
                    break;
                }
                // Condition 2: Substring match (e.g., "sql" in "ms sql server")
                if (cvKw.includes(jdKw) || cvKw.includes(jdKwSingular) || cvKw.includes(jdKwPlural)) {
                    foundMatch = true;
                    break;
                }
                 // Condition 3: Reverse Substring match (e.g., "power bi" in "bi")
                if (jdKw.includes(cvKw) || jdKwSingular.includes(cvKwSingular)) {
                    foundMatch = true;
                    break;
                }
            }

            if (foundMatch) {
                matched.add(jdKw);
            } else {
                missing.add(jdKw);
            }
        }
        return { matched: Array.from(matched), missing: Array.from(missing) };
    };

    const hardSkillMatches = getMatches(data.jdKeywords?.hardSkills, data.cvKeywords?.hardSkills);
    const softSkillMatches = getMatches(data.jdKeywords?.softSkills, data.cvKeywords?.softSkills);

    const jdHardSkillsCount = (data.jdKeywords?.hardSkills || []).length;
    const hardSkillScore = jdHardSkillsCount > 0
        ? (hardSkillMatches.matched.length / jdHardSkillsCount) * weights.hardSkills * 100
        : weights.hardSkills * 100;

    const jdSoftSkillsCount = (data.jdKeywords?.softSkills || []).length;
    const softSkillScore = jdSoftSkillsCount > 0
        ? (softSkillMatches.matched.length / jdSoftSkillsCount) * weights.softSkills * 100
        : weights.softSkills * 100;

    // --- Experience, Impact, Education Scoring ---
    let experienceScore = 0;
    if ((data.jdRequirements?.experienceYears || 0) > 0) {
        const ratio = (data.cvQualifications?.totalExperienceYears || 0) / data.jdRequirements.experienceYears;
        experienceScore = Math.min(1, ratio) * weights.experience * 100;
    } else { experienceScore = weights.experience * 100; }

    const actionVerbRatio = Math.min(1, (data.impactMetrics?.actionVerbCount || 0) / 5);
    const quantifiedResultRatio = Math.min(1, (data.impactMetrics?.quantifiedResultsCount || 0) / 3);
    const impactScore = ((actionVerbRatio * 0.5) + (quantifiedResultRatio * 0.5)) * weights.impact * 100;

    const eduLevels = { 'Any': 0, 'High School': 1, 'Bachelors': 2, 'Masters': 3, 'PhD': 4 };
    const cvEdu = eduLevels[data.cvQualifications?.highestEducation] || 0;
    const jdEdu = eduLevels[data.jdRequirements?.educationLevel] || 0;
    const educationScore = cvEdu >= jdEdu ? weights.education * 100 : 0;

    const totalScore = Math.ceil(hardSkillScore + softSkillScore + experienceScore + impactScore + educationScore);

    return {
        overallScore: Math.min(100, totalScore),
        scoreBreakdown: {
            hardSkills: { score: Math.ceil(hardSkillScore), weight: weights.hardSkills * 100, matched: hardSkillMatches.matched, missing: hardSkillMatches.missing },
            softSkills: { score: Math.ceil(softSkillScore), weight: weights.softSkills * 100, matched: softSkillMatches.matched, missing: softSkillMatches.missing },
            experience: { score: Math.ceil(experienceScore), weight: weights.experience * 100, required: data.jdRequirements?.experienceYears, found: data.cvQualifications?.totalExperienceYears },
            impact: { score: Math.ceil(impactScore), weight: weights.impact * 100, actionVerbs: data.impactMetrics?.actionVerbCount, quantifiedResults: data.impactMetrics?.quantifiedResultsCount },
            education: { score: Math.ceil(educationScore), weight: weights.education * 100, required: data.jdRequirements?.educationLevel, found: data.cvQualifications?.highestEducation }
        }
    };
};


export const useAtsAnalysis = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

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
            const isPro = user?.subscriptionStatus === 'active';
            if (!isPro) {
                const userDocRef = doc(db, 'users', user.uid);
                const newScanCount = Math.max(0, (user.atsScansRemaining || 1) - 1);
                await updateDoc(userDocRef, { atsScansRemaining: newScanCount });
            }
        } catch (e) { console.error("Error saving scan to Firestore:", e); }
    };

    const runAnalysis = async ({ cvText, jobDescription, cvFile }) => {
        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            // --- STEP 1: ISOLATED AI EXTRACTION ---
            setLoadingMessage('Step 1/4: Analyzing your CV...');
            
            const cvExtractionPrompt = `Your task is to analyze the following CV text and extract a comprehensive list of hard skills.
            Hard skills include:
            1.  Technical concepts and processes (e.g., Accounts Payable, General Ledger, Reconciliations, IFRS, GAAP, SEO, Agile).
            2.  Software and tools (e.g., SAP, QuickBooks, Excel, Python, PowerBI, Figma, Jira).
            Be literal and extract any term that matches these categories, even if it appears in a sentence.
            Also extract soft skills, education, experience, and timeline.
            Return ONLY a single minified JSON object.
            CV: --- ${cvText} ---
            JSON structure: { "cvKeywords": { "hardSkills": ["<list>"], "softSkills": ["<list>"] }, "cvQualifications": { "totalExperienceYears": <integer>, "highestEducation": "<string>" }, "impactMetrics": { "actionVerbCount": <integer>, "quantifiedResultsCount": <integer> }, "jobTimeline": [ { "role": "<string>", "company": "<string>", "startDate": "<YYYY-MM>", "endDate": "<YYYY-MM or 'Present'>" } ] }`;

            const jdExtractionPrompt = `Your task is to analyze the following Job Description and extract a comprehensive list of required hard skills.
            Hard skills include:
            1.  Technical concepts and processes (e.g., Accounts Payable, General Ledger, Reconciliations, SEO, Agile).
            2.  Software and tools (e.g., MS Excel, accounting software, Figma, Jira).
            Be literal and extract any term that matches these categories.
            Also extract soft skills and other requirements.
            Return ONLY a single minified JSON object.
            JD: --- ${jobDescription} ---
            JSON structure: { "jdKeywords": { "hardSkills": ["<list>"], "softSkills": ["<list>"] }, "jdRequirements": { "experienceYears": <integer>, "educationLevel": "<string>" } }`;
            
            // Run both AI calls in parallel for efficiency
            const [cvResponse, jdResponse] = await Promise.all([
                aiService.callAI(cvExtractionPrompt, 0.0),
                aiService.callAI(jdExtractionPrompt, 0.0)
            ]);

            // Clean and parse the isolated, uncontaminated data
            const cvData = JSON.parse(extractJsonFromString(cvResponse));
            const jdData = JSON.parse(extractJsonFromString(jdResponse));
            const extractedData = { ...cvData, ...jdData };

            // --- STEP 2: UX DELAY ---
            setLoadingMessage('Step 2/4: Analyzing Job Description...');
            await sleep(800);
            
            // --- STEP 3: DETERMINISTIC SCORING ---
            setLoadingMessage('Step 3/4: Calculating deterministic match score...');
            await sleep(800);
            const scoreData = calculateRealScore(extractedData);

            // --- STEP 4: QUALITATIVE FEEDBACK ---
            setLoadingMessage('Step 4/4: Generating recruiter feedback...');
            const feedbackPrompt = `You are a senior recruiter. A candidate has a ${scoreData.overallScore}% match score for a job. Their missing keywords include: ${scoreData.scoreBreakdown.hardSkills.missing.slice(0, 5).join(', ')}. Your response MUST be ONLY a single minified JSON object. Do NOT include markdown. JSON: { "recruiterGutReaction": "<string, your 15-second gut reaction>", "finalSummary": "<string, a strategic summary for the candidate on how to improve>", "suggestedInterviewQuestions": ["<question 1 based on potential gaps>", "<question 2 about their strengths>"] }`;

            const feedbackResponse = await aiService.callAI(feedbackPrompt, 0.6);
            const qualitativeFeedback = JSON.parse(extractJsonFromString(feedbackResponse));

            const finalResult = { ...scoreData, qualitativeFeedback, timeline: extractedData.jobTimeline };

            setAnalysisResult(finalResult);
            await saveScanToFirestore(finalResult, jobDescription, cvFile.name);

        } catch (err) {
            // This catch block now provides a much more useful error message to the user.
            console.error("Analysis pipeline failed:", err);
            setError(`Analysis failed. Reason: ${err.message}. This can sometimes be caused by the AI's safety filters. Please try modifying your CV or Job Description text slightly and try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    const resetAnalysis = () => {
        setAnalysisResult(null);
        setError('');
    };

    return { isLoading, loadingMessage, error, analysisResult, runAnalysis, resetAnalysis };
};
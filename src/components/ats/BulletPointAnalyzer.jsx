// src/components/ats/BulletPointAnalyzer.jsx
"use client";

import React, { useState } from 'react';
import { aiService } from '@/services/aiService';

// A simple spinner for the rewrite button
const RewriteSpinner = () => (
    <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
);

export const BulletPointAnalyzer = ({ bullet, jobTitle, jobDescription, missingKeywords }) => {
    const [isRewriting, setIsRewriting] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [error, setError] = useState('');

    const handleRewrite = async () => {
        setIsRewriting(true);
        setSuggestion('');
        setError('');
        try {
            const rewrittenText = await aiService.rewriteBulletPoint(bullet, jobTitle, jobDescription, missingKeywords);
            setSuggestion(rewrittenText);
        } catch (err) {
            setError('Failed to get suggestion. Please try again.');
            console.error(err);
        } finally {
            setIsRewriting(false);
        }
    };

    const isWeak = !/^\w+(ed|d|ing|s)\b/i.test(bullet.trim()) || bullet.toLowerCase().startsWith('responsible for');

    return (
        <div className="p-4 border rounded-lg bg-white mb-4 shadow-sm">
            <p className="text-gray-700">{bullet}</p>
            {isWeak && (
                <p className="text-xs text-amber-600 mt-2 font-semibold">Suggestion: This bullet point could be stronger. Try starting with an action verb.</p>
            )}
            
            <div className="mt-3 text-right">
                <button 
                    onClick={handleRewrite} 
                    disabled={isRewriting}
                    className="flex items-center justify-center gap-2 px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50 transition-colors"
                >
                    {isRewriting ? <><RewriteSpinner /> Rewriting...</> : '✨ Rewrite with AI'}
                </button>
            </div>

            {suggestion && (
                <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-400">
                    <p className="text-sm font-bold text-green-800">AI Suggestion:</p>
                    <p className="text-gray-800 mt-1">{suggestion}</p>
                </div>
            )}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
};
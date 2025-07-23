"use client";

import React, { useState } from 'react';
import CheckIcon from '@/components/common/CheckIcon'; // --- THIS IS THE FIX ---

const ATSResult = ({ result, onReset }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!result) return null;

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'extracted', label: 'Extracted Data' },
        { id: 'feedback', label: 'Detailed Feedback' },
    ];

    return (
        <div className="w-full bg-white p-6 rounded-xl shadow-2xl border transition-all animate-fade-in">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="text-left">
                        <div className="flex items-center justify-center flex-col sm:flex-row gap-8">
                            <div className="relative h-40 w-40">
                                <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200" strokeWidth="2"></circle>
                                    <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${getScoreColor(result.matchScore)}`} strokeWidth="2" strokeDasharray={`${result.matchScore}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></circle>
                                </svg>
                                <div className={`absolute inset-0 flex items-center justify-center text-5xl font-bold ${getScoreColor(result.matchScore)}`}>
                                    {result.matchScore}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Final Summary</h3>
                                <p className="text-gray-600">{result.finalSummary}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'extracted' && (
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Data Extracted by ATS</h3>
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg mb-4">
                            <strong>Note:</strong> If this data is incorrect, it may indicate your CV's layout is not ATS-friendly. Consider simplifying your formatting.
                        </p>
                        <ul className="space-y-2 text-gray-700">
                            <li><strong>Name:</strong> {result.extractedData.name}</li>
                            <li><strong>Email:</strong> {result.extractedData.email}</li>
                            <li><strong>Phone:</strong> {result.extractedData.phone}</li>
                            <li><strong>Experience:</strong> {result.extractedData.totalExperienceYears} years</li>
                            <li><strong>Skills:</strong> {result.extractedData.extractedSkills.join(', ')}</li>
                        </ul>
                    </div>
                )}
                
                {activeTab === 'feedback' && (
                    <div className="text-left space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-green-700 mb-3">Positive Points</h3>
                            <ul className="space-y-2">
                                {result.detailedAnalysis.positivePoints.map((item, index) => (
                                    <li key={index} className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 mt-1"/><span><strong>{item.category}:</strong> {item.point}</span></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-red-700 mb-3">Areas for Improvement</h3>
                             <ul className="space-y-2">
                                {result.detailedAnalysis.areasForImprovement.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="flex-shrink-0 w-5 h-5 text-red-500 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span><strong>{item.category}:</strong> {item.recommendation}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-8 text-center">
                <button
                    onClick={onReset}
                    className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
                >
                    Scan Another CV
                </button>
            </div>
        </div>
    );
};

export default ATSResult;
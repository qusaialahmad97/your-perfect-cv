"use client";

import React, { useState } from 'react';
import CheckIcon from '@/components/common/CheckIcon';

// Helper component for the score breakdown progress bars
const ScoreBar = ({ title, score }) => {
    const getBarColor = (s) => (s >= 85 ? 'bg-green-500' : s >= 60 ? 'bg-yellow-500' : 'bg-red-500');
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-gray-700">{title}</span>
                <span className={`text-sm font-medium text-white px-1.5 rounded ${getBarColor(score)}`}>{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${getBarColor(score)} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    );
};

// Helper component for the detailed content feedback cards
const FeedbackCard = ({ item }) => (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
        <p className="text-sm font-semibold text-blue-800 bg-blue-50 inline-block px-2 py-1 rounded-md mb-2">{item.category}</p>
        <blockquote className="border-l-4 border-gray-300 pl-3 my-2">
            <p className="text-sm text-gray-600 italic">"{item.originalText}"</p>
        </blockquote>
        <p className="text-sm my-2"><strong className="text-red-600">Critique:</strong> {item.recommendation}</p>
        <div className="p-3 bg-green-50 rounded-md border border-green-200">
            <p className="text-xs font-bold text-green-800">💡 Suggested Rewrite:</p>
            <p className="text-sm text-green-900 font-medium">{item.suggestedRewrite}</p>
        </div>
    </div>
);

// Helper component for styled list items with icons
const IconListItem = ({ text, iconType }) => {
    const icons = {
        positive: <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0"/>,
        negative: <span className="text-yellow-500 mr-2 mt-1 flex-shrink-0 text-lg">⚠️</span>,
        question: <span className="text-gray-500 mr-2 mt-1 flex-shrink-0 text-lg">❓</span>,
    };
    return (
        <li className="flex items-start">
            {icons[iconType]}
            <span className="text-gray-700">{text}</span>
        </li>
    );
};

const ATSResult = ({ result, onReset }) => {
    const [activeTab, setActiveTab] = useState('summary');
    if (!result) return null;

    const getScoreColor = (score) => (score >= 85 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500');
    const getExperienceColor = (level) => (level === 'Good Match' ? 'bg-green-100 text-green-800' : level === 'Overqualified' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800');

    const tabs = [
        { id: 'summary', label: 'Summary' }, 
        { id: 'keywords', label: 'Keyword Analysis' }, 
        { id: 'coaching', label: 'AI Career Coach' }
    ];

    return (
        <div className="w-full bg-gray-50 p-6 rounded-xl shadow-2xl border transition-all animate-fade-in text-left">
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'summary' && (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="flex flex-col items-center">
                            <div className={`text-7xl font-bold ${getScoreColor(result.overallScore)}`}>{result.overallScore}<span className="text-3xl">%</span></div>
                            <p className="font-semibold text-gray-600">Overall Match Score</p>
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
                                <p className="font-semibold text-gray-800">Recruiter's First Impression:</p>
                                <p className="text-sm text-gray-600 italic">"{result.recruiterFeedback}"</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-700 text-center md:text-left">{result.finalSummary}</p>
                            <h3 className="text-lg font-bold text-gray-800 pt-4 border-t">Score Breakdown</h3>
                            <ScoreBar title="Keyword Match" score={result.scoreBreakdown.keywordMatch} />
                            <ScoreBar title="Impact & Achievements" score={result.scoreBreakdown.impact} />
                            <ScoreBar title="Relevance" score={result.scoreBreakdown.relevance} />
                            <ScoreBar title="Formatting" score={result.scoreBreakdown.formatting} />
                        </div>
                    </div>
                )}
                {activeTab === 'keywords' && (
                    <div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Technical Skills</h3>
                                <div className="flex flex-wrap gap-2 mb-4">{result.keywordAnalysis.technical.matched.map(kw => <span key={kw} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}</div>
                                <div className="flex flex-wrap gap-2">{result.keywordAnalysis.technical.missing.map(kw => <span key={kw} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Soft Skills</h3>
                                <div className="flex flex-wrap gap-2 mb-4">{result.keywordAnalysis.softSkills.matched.map(kw => <span key={kw} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}</div>
                                <div className="flex flex-wrap gap-2">{result.keywordAnalysis.softSkills.missing.map(kw => <span key={kw} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}</div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'coaching' && (
                     <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Content Coaching: AI Rewrites</h3>
                            {result.contentFeedback.map((item, index) => (
                                <FeedbackCard key={index} item={item} />
                            ))}
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Industry & Role Feedback</h3>
                                <div className={`flex items-start p-4 rounded-lg ${result.industryFeedback.isAppropriate ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
                                    <span className="text-xl mr-3">{result.industryFeedback.isAppropriate ? '✅' : '⚠️'}</span>
                                    <p className="text-gray-700">{result.industryFeedback.comment}</p>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Career Timeline Analysis</h3>
                                <div className={`flex items-start p-4 rounded-lg ${!result.timelineAnalysis.hasGaps ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
                                    <span className="text-xl mr-3">{!result.timelineAnalysis.hasGaps ? '✅' : '⚠️'}</span>
                                    <p className="text-gray-700">{result.timelineAnalysis.comment}</p>
                                </div>
                            </div>
                        </div>
                         <div className="border-t pt-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Interview Preparation Questions</h3>
                            <ul className="space-y-3">
                                {result.interviewQuestions.map((item, index) => (
                                    <IconListItem key={index} text={item} iconType="question" />
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-8 text-center border-t pt-6">
                <button onClick={onReset} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition">
                    Scan Another CV
                </button>
            </div>
        </div>
    );
};

export default ATSResult;
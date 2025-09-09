"use client";

import React, { useState } from 'react';

// --- Reusable Sub-Components for a Professional Look ---

const ScoreDonut = ({ score }) => {
    const getScoreColor = (s) => (s >= 85 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444');
    const color = getScoreColor(score);
    const circumference = 2 * Math.PI * 54; // Circle radius is 54
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-200" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
                <circle
                    stroke={color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="transparent"
                    r="54"
                    cx="60"
                    cy="60"
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-out' }}
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-bold" style={{ color }}>{score}</span>
                <span className="text-sm font-medium text-gray-500">Overall Score</span>
            </div>
        </div>
    );
};

const BreakdownItem = ({ title, score, weight, details }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-gray-800">{title}</h4>
            <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-sm">{Math.round(score)} / {weight}</span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{details}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(score / weight) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
    </div>
);

const KeywordPill = ({ keyword, type }) => {
    const styles = {
        matched: 'bg-green-100 text-green-800 border-green-200',
        missing: 'bg-red-100 text-red-800 border-red-200'
    };
    return <span className={`text-sm font-medium px-3 py-1 rounded-full border ${styles[type]}`}>{keyword}</span>;
};

const TimelineEvent = ({ event, isLast }) => (
    <div className="relative pl-8">
        {!isLast && <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-gray-300"></div>}
        <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
        <p className="font-bold text-gray-800">{event.role} at {event.company}</p>
        <p className="text-sm text-gray-500">{event.startDate} – {event.endDate}</p>
    </div>
);

// --- Main ATSResult Component ---

const ATSResult = ({ result, onReset }) => {
    // We set the initial tab state here. When the component re-mounts, it will always start at the dashboard.
    const [activeTab, setActiveTab] = useState('dashboard');
    if (!result) return null;

    const { overallScore, scoreBreakdown, qualitativeFeedback, timeline } = result;

    const tabs = [
        { id: 'dashboard', label: 'Score Dashboard' },
        { id: 'keywords', label: 'Keyword Analysis' },
        { id: 'experience', label: 'Experience & Impact' },
        { id: 'coaching', label: 'Recruiter Notes' }
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="flex flex-col items-center justify-center">
                            <ScoreDonut score={overallScore} />
                             <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center w-full">
                                <p className="font-semibold text-gray-800">Recruiter's 15-Second Gut Reaction:</p>
                                <p className="text-sm text-gray-600 italic">"{qualitativeFeedback.recruiterGutReaction}"</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800">Your Score, Explained</h3>
                            <p className="text-gray-600">Your score is calculated based on key metrics. Here's your transparent breakdown:</p>
                            <BreakdownItem title="Hard Skill Match" score={scoreBreakdown.hardSkills.score} weight={scoreBreakdown.hardSkills.weight} details={`${scoreBreakdown.hardSkills.matched.length} of ${scoreBreakdown.hardSkills.missing.length + scoreBreakdown.hardSkills.matched.length} required skills found.`} />
                            <BreakdownItem title="Experience Alignment" score={scoreBreakdown.experience.score} weight={scoreBreakdown.experience.weight} details={`${scoreBreakdown.experience.found} years found vs. ${scoreBreakdown.experience.required} required.`} />
                            <BreakdownItem title="CV Impact & Results" score={scoreBreakdown.impact.score} weight={scoreBreakdown.impact.weight} details={`${scoreBreakdown.impact.quantifiedResults} quantified results & ${scoreBreakdown.impact.actionVerbs} action verbs found.`} />
                        </div>
                    </div>
                );
            case 'keywords':
                 return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">✅ Hard Skills Matched</h3>
                            <div className="flex flex-wrap gap-2">{scoreBreakdown.hardSkills.matched.map(kw => <KeywordPill key={kw} keyword={kw} type="matched" />)}</div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-red-600 mb-3">❌ Hard Skills Missing</h3>
                            <p className="text-sm text-gray-600 mb-4">These are critical keywords from the job description missing from your CV. Adding them could significantly boost your score.</p>
                            <div className="flex flex-wrap gap-2">{scoreBreakdown.hardSkills.missing.map(kw => <KeywordPill key={kw} keyword={kw} type="missing" />)}</div>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">✅ Soft Skills Matched</h3>
                            <div className="flex flex-wrap gap-2">{scoreBreakdown.softSkills.matched.map(kw => <KeywordPill key={kw} keyword={kw} type="matched" />)}</div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">❌ Soft Skills Missing</h3>
                            <div className="flex flex-wrap gap-2">{scoreBreakdown.softSkills.missing.map(kw => <KeywordPill key={kw} keyword={kw} type="missing" />)}</div>
                        </div>
                    </div>
                );
            case 'experience':
                 return (
                    <div className="space-y-8">
                         <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Career Timeline</h3>
                            {timeline && timeline.length > 0 ? (
                                <div className="space-y-6 border-l-2 border-gray-300 border-dashed ml-3 py-4">
                                    {timeline.map((event, index) => <TimelineEvent key={index} event={event} isLast={index === timeline.length - 1}/>)}
                                </div>
                            ) : (
                                <p className="text-gray-500 bg-gray-50 p-4 rounded-md">The AI could not extract a timeline from your CV.</p>
                            )}
                         </div>
                    </div>
                );
            case 'coaching':
                 return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Final Summary</h3>
                            <p className="text-gray-700 bg-gray-100 p-4 rounded-lg">{qualitativeFeedback.finalSummary}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Tone & Industry Fit</h3>
                            <p className="text-gray-700 bg-gray-100 p-4 rounded-lg">{qualitativeFeedback.toneAndIndustryFit}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Suggested Interview Questions</h3>
                            <ul className="space-y-3 list-disc list-inside">
                                {qualitativeFeedback.suggestedInterviewQuestions.map((q, i) => <li key={i} className="text-gray-700">{q}</li>)}
                            </ul>
                        </div>
                    </div>
                 );
            default: return null;
        }
    };

    return (
        <div className="w-full bg-white p-6 rounded-xl shadow-2xl border transition-all animate-fade-in text-left">
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="py-4 min-h-[300px]">
                {renderContent()}
            </div>
            
            <div className="mt-8 text-center border-t pt-6">
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
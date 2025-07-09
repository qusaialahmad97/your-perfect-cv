// src/components/cv/AIQuestionnaire.jsx

import React, { useState } from 'react';

const aiQuestions = [
    { id: 'contactInfo', question: "What is your full name and best contact information?", placeholder: "e.g., John Doe, john.doe@email.com, (123) 456-7890, linkedin.com/in/johndoe" },
    { id: 'roleAndExperience', question: "What role are you applying for, and can you briefly describe your years of experience?", placeholder: "e.g., Senior Software Engineer with 8+ years of experience in cloud computing and backend development." },
    { id: 'recentJob', question: "Describe your most recent or relevant job. What was your title, the company, and what were your key achievements?", placeholder: "e.g., At TechCorp, I led the 'Phoenix' project, reducing server costs by 20% by migrating services to AWS Lambda. I also mentored two junior developers." },
    { id: 'skills', question: "What are your top 5-10 technical skills and your most important soft skills?", placeholder: "e.g., Technical: Python, AWS, Docker, SQL, React. Soft skills: Project Management, Team Leadership, Problem-solving." },
    { id: 'education', question: "What is your highest level of education?", placeholder: "e.g., M.Sc. in Computer Science from the University of Technology, graduated in 2019." }
];

const AIQuestionnaire = ({ generateCvFromQuestions, isAiLoading, primaryColor }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (e) => {
        const { name, value } = e.target;
        setAnswers(prev => ({ ...prev, [name]: value }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < aiQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const currentQuestion = aiQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / aiQuestions.length) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-center mb-2">AI-Powered CV Builder</h2>
            <p className="text-center text-gray-500 mb-6">Answer a few questions, and our AI will do the rest.</p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%`, backgroundColor: primaryColor, transition: 'width 0.3s ease-in-out' }}></div>
            </div>

            <div className="mb-6">
                <label htmlFor={currentQuestion.id} className="block text-lg font-medium text-gray-800 mb-3">{currentQuestion.question}</label>
                <textarea
                    id={currentQuestion.id}
                    name={currentQuestion.id}
                    rows="5"
                    value={answers[currentQuestion.id] || ''}
                    onChange={handleAnswerChange}
                    placeholder={currentQuestion.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <div className="flex justify-between items-center">
                <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                    Previous
                </button>
                {currentQuestionIndex < aiQuestions.length - 1 ? (
                    <button onClick={nextQuestion} className="py-2 px-4 text-sm font-medium rounded-md text-white" style={{ backgroundColor: primaryColor }}>
                        Next
                    </button>
                ) : (
                    <button onClick={() => generateCvFromQuestions(answers)} disabled={isAiLoading} className="py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                        {isAiLoading ? 'Generating...' : 'Generate CV with AI'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AIQuestionnaire;
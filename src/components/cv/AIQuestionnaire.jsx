// This code can be a standalone component (e.g., src/components/cv/AIQuestionnaire.jsx)
// or nested within your CvBuilder component file.

import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { aiService } from '@/services/aiService'; // Make sure the path is correct

// This line is important for pdf.js to work correctly with bundlers like Webpack (used by Next.js)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


const AIQuestionnaire = ({ cvData, setCvData, handleChange, generateCvFromUserInput, isAiLoading, primaryColor, fillWithSampleData }) => {
    // The granular questions array for better user guidance
    const aiQuestions = [
        { id: 'targetRole', question: "What is the exact job title you are applying for?", placeholder: "e.g., Senior Frontend Developer", required: true, dataKey: 'aiHelpers' },
        { id: 'jobDescription', question: "To get the best results, paste the job description here.", placeholder: "Pasting the job description helps the AI tailor your CV...", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'name', question: "What is your full name?", placeholder: "e.g., John Doe", required: true, dataKey: 'personalInformation' },
        { id: 'professionalTitle', question: "What professional title or target role do you want displayed directly under your name?", placeholder: "e.g., Senior Software Engineer", required: true, dataKey: 'personalInformation' },
        { id: 'email', question: "What is your email address?", placeholder: "e.g., john.doe@email.com", required: true, dataKey: 'personalInformation' },
        { id: 'phone', question: "What is your phone number?", placeholder: "e.g., (123) 456-7890", optional: true, dataKey: 'personalInformation' },
        { id: 'linkedin', question: "What is your LinkedIn profile URL?", placeholder: "e.g., linkedin.com/in/johndoe", optional: true, dataKey: 'personalInformation' },
        { id: 'city', question: "Which city do you live in?", placeholder: "e.g., San Francisco", optional: true, dataKey: 'personalInformation' },
        { id: 'country', question: "And which country?", placeholder: "e.g., USA", optional: true, dataKey: 'personalInformation' },
        { id: 'portfolioLink', question: "Do you have a portfolio or website link?", placeholder: "e.g., github.com/johndoe", optional: true, dataKey: 'personalInformation' },
        { id: 'summary', question: "In one or two sentences, summarize your professional background.", placeholder: "e.g., I'm a software engineer with over 8 years of experience building scalable web applications.", required: true, isTextarea: true, dataKey: null },
        
        { header: 'Most Relevant Experience', id: 'role', question: "What was your job title?", placeholder: "e.g., Lead Developer", required: true, dataKey: 'experience' },
        { id: 'company', question: "What was the company's name?", placeholder: "e.g., TechCorp Inc.", required: true, dataKey: 'experience' },
        { id: 'location', question: "Where was it located?", placeholder: "e.g., San Francisco, CA", optional: true, dataKey: 'experience' },
        { id: 'startDate', question: "When did you start?", placeholder: "e.g., 2018-06", required: true, dataKey: 'experience' },
        { id: 'endDate', question: "When did you leave? (or 'Present')", placeholder: "e.g., 2022-12 or Present", required: true, dataKey: 'experience' },
        { id: 'achievements', question: "Describe your key achievements and responsibilities.", placeholder: "e.g., Led a team of 5 developers to launch a new product feature, increasing user engagement by 15%...", isTextarea: true, required: true, dataKey: 'experience' },

        { header: 'Highest Level of Education', id: 'degree', question: "What was your degree or program?", placeholder: "e.g., M.Sc. in Computer Science", required: true, dataKey: 'education' },
        { id: 'institution', question: "What was the name of the institution?", placeholder: "e.g., University of Technology", required: true, dataKey: 'education' },
        { id: 'graduationYear', question: "What was your graduation year?", placeholder: "e.g., 2019", required: true, dataKey: 'education' },
        { id: 'location', question: "Where was the institution located?", placeholder: "e.g., New York, NY", optional: true, dataKey: 'education' },
        
        { id: 'technical', question: "List your key technical skills.", placeholder: "e.g., Java, Python, React, AWS, Docker", required: true, dataKey: 'skills' },
        { id: 'soft', question: "And what are your most important soft skills?", placeholder: "e.g., Team Leadership, Project Management, Communication", required: true, dataKey: 'skills' },
        { id: 'languages', question: "Which languages do you speak, and at what level?", placeholder: "e.g., English (Native), Spanish (Conversational)", optional: true, dataKey: null },
        { id: 'referencesRaw', question: "List any professional references. (Optional)", placeholder: "e.g., John Doe, Senior Manager at Acme Corp.", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'awardsRaw', question: "Tell us about any awards or recognitions you've received. (Optional)", placeholder: "e.g., Employee of the Year 2023", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'coursesRaw', question: "List any relevant courses you've completed. (Optional)", placeholder: "e.g., Machine Learning Specialization, Coursera (2020)", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'certificationsRaw', question: "Include any professional certifications you hold. (Optional)", placeholder: "e.g., AWS Certified Solutions Architect (2023)", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'customSectionsRaw', question: "Do you have other information like volunteer work or publications? (Optional)", placeholder: "e.g., 'Volunteer Work: Mentored junior developers.'", isTextarea: true, optional: true, dataKey: 'aiHelpers' }
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const fileInputRef = useRef(null);

    const nextQuestion = () => { if (currentQuestionIndex < aiQuestions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
    const prevQuestion = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            setParseError('Please select a PDF file.');
            return;
        }

        setIsParsing(true);
        setParseError('');

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ');
                }
                
                const parsedData = await aiService.parseCvText(fullText);
                
                // Merge parsed data into the main cvData state
                setCvData(prevData => ({
                    ...prevData,
                    personalInformation: { ...prevData.personalInformation, ...parsedData.personalInformation },
                    summary: parsedData.summary || prevData.summary,
                    experience: parsedData.experience?.length > 0 ? parsedData.experience : prevData.experience,
                    education: parsedData.education?.length > 0 ? parsedData.education : prevData.education,
                    skills: { ...prevData.skills, ...parsedData.skills },
                }));
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error(error);
            setParseError(error.message || 'Could not read or parse the PDF.');
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const currentQuestion = aiQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / aiQuestions.length) * 100;

    let currentValue = '';
    if (cvData) {
        if (currentQuestion.dataKey) {
            if (['experience', 'education'].includes(currentQuestion.dataKey)) {
                currentValue = cvData[currentQuestion.dataKey]?.[0]?.[currentQuestion.id] || '';
            } else {
                 currentValue = cvData[currentQuestion.dataKey]?.[currentQuestion.id] || '';
            }
        } else {
            currentValue = cvData[currentQuestion.id] || '';
        }
    }
    
    const handleInputChange = (e) => {
        const index = ['experience', 'education'].includes(currentQuestion.dataKey) ? 0 : undefined;
        handleChange(e, currentQuestion.dataKey, index);
    };
    
    const inputElement = currentQuestion.isTextarea ? (
        <textarea id={currentQuestion.id} rows={8} value={currentValue} onChange={handleInputChange} placeholder={currentQuestion.placeholder} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
    ) : (
        <input type="text" id={currentQuestion.id} value={currentValue} onChange={handleInputChange} placeholder={currentQuestion.placeholder} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
    );

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">AI-Powered CV Builder</h2>
                <button onClick={fillWithSampleData} className="text-xs bg-purple-100 text-purple-700 py-1 px-2 rounded-md hover:bg-purple-200">Fill Sample</button>
            </div>
            
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <p className="text-indigo-800 font-semibold mb-2">Have a CV already?</p>
                <p className="text-sm text-indigo-600 mb-3">Upload your PDF to pre-fill the questions instantly. We don't store your file.</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
                <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={isParsing}
                    className="w-full py-2 px-4 font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                    {isParsing ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>Parsing CV...</span></>
                    ) : ( "🚀 Upload CV to Pre-fill" )}
                </button>
                {parseError && <p className="text-red-500 text-xs mt-2">{parseError}</p>}
            </div>

            <p className="text-center text-gray-500 mb-6">Or, answer the questions below. Your progress is not auto-saved.</p>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="h-2 rounded-full" style={{ width: `${progress}%`, backgroundColor: primaryColor, transition: 'width 0.3s ease-in-out' }}></div>
            </div>

            <div className="mb-6">
                {currentQuestion.header && <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{currentQuestion.header}</h3>}
                <label htmlFor={currentQuestion.id} className="block text-lg font-medium text-gray-800 mb-3">
                    {currentQuestion.question}
                    {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                    {currentQuestion.optional && <span className="text-gray-400 text-sm ml-2">(Optional)</span>}
                </label>
                {inputElement}
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
                    <button onClick={generateCvFromUserInput} disabled={isAiLoading} className="py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                        {isAiLoading ? 'Generating...' : 'Generate CV with AI'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AIQuestionnaire;
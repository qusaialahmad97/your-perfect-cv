// Add this line at the very top
export const dynamic = 'force-dynamic';

"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { aiService } from '@/services/aiService';
import * as pdfjsLib from 'pdfjs-dist';

import ConfirmationModal from '@/components/common/ConfirmationModal';
import AiCvEditor from '@/components/cv/AiCvEditor';
import ManualCvForm from '@/components/cv/ManualCvForm';
import PrintableCv from '@/components/cv/PrintableCv';
import TemplateSelector from '@/components/cv/TemplateSelector';

// Configure the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf.worker.min.js`;

const Spinner = () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>;
const ButtonSpinner = () => <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>;

// --- The Complete AIQuestionnaire Component ---
const AIQuestionnaire = ({ cvData, setCvData, handleChange, generateCvFromUserInput, isAiLoading, primaryColor, fillWithSampleData }) => {
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
        { id: 'summary', question: "In one or two sentences, summarize your professional background.", placeholder: "e.g., I'm a software engineer with over 8 years of experience...", required: true, isTextarea: true, dataKey: null },
        { header: 'Most Relevant Experience', id: 'role', question: "What was your job title?", placeholder: "e.g., Lead Developer", required: true, dataKey: 'experience' },
        { id: 'company', question: "What was the company's name?", placeholder: "e.g., TechCorp Inc.", required: true, dataKey: 'experience' },
        { id: 'location', question: "Where was it located?", placeholder: "e.g., San Francisco, CA", optional: true, dataKey: 'experience' },
        { id: 'startDate', question: "When did you start?", placeholder: "e.g., 2018-06", required: true, dataKey: 'experience' },
        { id: 'endDate', question: "When did you leave? (or 'Present')", placeholder: "e.g., 2022-12 or Present", required: true, dataKey: 'experience' },
        { id: 'achievements', question: "Describe your key achievements and responsibilities.", placeholder: "e.g., Led a team of 5 developers...", isTextarea: true, required: true, dataKey: 'experience' },
        { header: 'Highest Level of Education', id: 'degree', question: "What was your degree or program?", placeholder: "e.g., M.Sc. in Computer Science", required: true, dataKey: 'education' },
        { id: 'institution', question: "What was the name of the institution?", placeholder: "e.g., University of Technology", required: true, dataKey: 'education' },
        { id: 'graduationYear', question: "What was your graduation year?", placeholder: "e.g., 2019", required: true, dataKey: 'education' },
        { id: 'location', question: "Where was the institution located?", placeholder: "e.g., New York, NY", optional: true, dataKey: 'education' },
        { id: 'technical', question: "List your key technical skills.", placeholder: "e.g., Java, Python, React...", required: true, dataKey: 'skills' },
        { id: 'soft', question: "And what are your most important soft skills?", placeholder: "e.g., Team Leadership, Project Management...", required: true, dataKey: 'skills' },
        { id: 'languages', question: "Which languages do you speak, and at what level?", placeholder: "e.g., English (Native), Spanish (Conversational)", optional: true, dataKey: null },
        { id: 'referencesRaw', question: "List any professional references. (Optional)", placeholder: "e.g., John Doe, Senior Manager...", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'awardsRaw', question: "Tell us about any awards or recognitions. (Optional)", placeholder: "e.g., Employee of the Year 2023", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'coursesRaw', question: "List any relevant courses. (Optional)", placeholder: "e.g., Machine Learning Specialization, Coursera", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'certificationsRaw', question: "Include any professional certifications. (Optional)", placeholder: "e.g., AWS Certified Solutions Architect", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'customSectionsRaw', question: "Do you have other information like volunteer work? (Optional)", placeholder: "e.g., 'Volunteer Work: Mentored junior developers.'", isTextarea: true, optional: true, dataKey: 'aiHelpers' }
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
                        <><ButtonSpinner /><span>Parsing CV...</span></>
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


// --- The Parent CvBuilder Component ---
const CvBuilder = () => {
    const cvTemplates = [
        { id: 'modern', name: 'Modern Minimalist', imageUrl: '/images/templates/modern.jpg', defaultSettings: { primaryColor: '#007BFF', dividerColor: '#e0e0e0', paragraphFontSize: '11pt', headerFontSize: '14pt', lineHeight: '1.4', fontFamily: 'Inter, sans-serif' } },
        { id: 'classic', name: 'Classic Professional', imageUrl: '/images/templates/classic.jpg', defaultSettings: { primaryColor: '#333333', dividerColor: '#cccccc', paragraphFontSize: '10.5pt', headerFontSize: '13.5pt', lineHeight: '1.5', fontFamily: 'Merriweather, serif' } },
        { id: 'elegant', name: 'Elegant Serenity', imageUrl: '/images/templates/elegant.jpg', defaultSettings: { primaryColor: '#8E44AD', dividerColor: '#d8bfd8', paragraphFontSize: '11pt', headerFontSize: '15pt', lineHeight: '1.4', fontFamily: 'Open Sans, sans-serif' } },
        { id: 'bold', name: 'Bold & Impactful', imageUrl: '/images/templates/professional.jpg', defaultSettings: { primaryColor: '#D9534F', dividerColor: '#f2dede', paragraphFontSize: '12pt', headerFontSize: '16pt', lineHeight: '1.3', fontFamily: 'Montserrat, sans-serif' } },
        { id: 'creative', name: 'Creative Flair', imageUrl: '/images/templates/creative.jpg', defaultSettings: { primaryColor: '#28A745', dividerColor: '#d4edda', paragraphFontSize: '10pt', headerFontSize: '13pt', lineHeight: '1.6', fontFamily: 'Lato, sans-serif' } },
        { id: 'minimalist', name: 'Clean & Simple', imageUrl: '/images/templates/minimalist.jpg', defaultSettings: { primaryColor: '#6C757D', dividerColor: '#e9ecef', paragraphFontSize: '11.5pt', headerFontSize: '14.5pt', lineHeight: '1.45', fontFamily: 'Roboto, sans-serif' } }
    ];

    const getInitialCvData = (templateId = null) => {
        let initialSettings = {
            primaryColor: '#2563EB', dividerColor: '#e0e0e0', paragraphFontSize: '11pt', headerFontSize: '14pt', lineHeight: '1.4', fontFamily: 'Inter, sans-serif', templateId: templateId || 'modern',
            sectionOrder: [ 'summary', 'experience', 'education', 'projects', 'skills', 'languages', 'references', 'awards', 'courses', 'certifications', 'customSections' ]
        };
        if (templateId) {
            const selectedTemplate = cvTemplates.find(t => t.id === templateId);
            if (selectedTemplate) {
                initialSettings = { ...initialSettings, ...selectedTemplate.defaultSettings, templateId: templateId };
            }
        }
        return {
            personalInformation: { name: '', professionalTitle: '', email: '', phone: '', linkedin: '', city: '', country: '', portfolioLink: '', contact: '' },
            summary: '<p></p>', experience: [], education: [], projects: [], skills: { technical: '', soft: '' }, languages: '', references: [], awards: [], courses: [], certifications: [], customSections: [],
            settings: initialSettings,
            aiHelpers: { targetRole: '', jobDescription: '', referencesRaw: '', awardsRaw: '', coursesRaw: '', certificationsRaw: '', customSectionsRaw: '' },
        };
    };

    const [cvData, setCvData] = useState(null);
    const [cvId, setCvId] = useState(null);
    const [cvName, setCvName] = useState("Untitled CV");
    const [mode, setMode] = useState(null);
    const [aiFlowStep, setAiFlowStep] = useState(null);
    const [isAiGenerated, setIsAiGenerated] = useState(false);
    const primaryColor = cvData?.settings?.primaryColor || '#2563EB';
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
    const [pageState, setPageState] = useState('LOADING');
    const [saveStatus, setSaveStatus] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading, isAuthenticated } = useAuth();
    const componentToPrintRef = useRef(null);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: componentToPrintRef, 
        documentTitle: `${cvName.replace(/\s/g, '_') || 'My_CV'}`,
        onPrintError: (error) => console.error("Error printing:", error),
        pageStyle: `@page { size: A4; margin: 1cm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`
    });

    const fillWithSampleData = () => {
        const sampleData = {
            ...cvData,
            personalInformation: { name: 'Qusai Ahmad', professionalTitle: 'Senior QA Automation Engineer', email: 'qusai.ahmad@email.com', phone: '(123) 456-7890', linkedin: 'linkedin.com/in/q-ahmad', city: 'Amman', country: 'Jordan', portfolioLink: 'github.com/q-ahmad' },
            summary: "Highly accomplished Senior QA Automation Engineer with over 7 years of experience specializing in building robust testing frameworks for web and mobile applications. Proven ability to lead teams, optimize CI/CD pipelines, and significantly improve quality and efficiency. Expertise in Cypress, Selenium, Java, and API testing.",
            experience: [{
                role: 'Test Lead',
                company: 'Innovate Solutions',
                location: 'Amman, Jordan',
                startDate: '2020-01',
                endDate: 'Present',
                achievements: 'Designed and implemented a new CI/CD testing pipeline using Jenkins and Selenium, which decreased bug detection time by 40%. Led a team of 5 QA engineers, improving test coverage by 30% for our flagship product. Collaborated with development teams to integrate testing earlier in the SDLC.'
            }],
            education: [{
                degree: 'B.Sc. in Software Engineering',
                institution: 'Hashemite University',
                location: 'Zarqa, Jordan',
                graduationYear: '2019'
            }],
            skills: {
                technical: 'Java, Selenium, Cypress, Appium, SQL, Postman, Jira, Jenkins, GitLab CI/CD, Agile Methodologies, TestRail',
                soft: 'Critical Thinking, Communication, Mentorship, Problem-solving, Team Leadership, Adaptability'
            },
            languages: 'English (Fluent), Arabic (Native)',
            aiHelpers: {
                targetRole: 'Senior QA Automation Engineer',
                jobDescription: 'We are seeking a Senior QA Automation Engineer with extensive experience in creating testing frameworks from scratch. Must be proficient in Cypress and/or Selenium, have strong Java skills, and be able to work with CI/CD pipelines like Jenkins. Experience with API testing using Postman is a plus. Candidates should demonstrate strong leadership and problem-solving skills.',
                referencesRaw: 'Professor Jane Smith, (555) 123-4567, Head of CS Dept. at Hashemite University; Dr. Alex Chen, (555) 987-6543, Engineering Director at Innovate Solutions.',
                awardsRaw: 'Innovator of the Year Award (2023), recognized at Tech Solutions Annual Gala for developing a groundbreaking test automation tool.',
                coursesRaw: 'Advanced Selenium WebDriver (Udemy, 2022); Certified ScrumMaster (Scrum Alliance, 2021); API Testing with Postman (LinkedIn Learning, 2020).',
                certificationsRaw: 'AWS Certified Solutions Architect (2023); PMP (2021).',
                customSectionsRaw: 'Volunteer Work: Mentored junior developers at Code for Good Foundation (2020-2023), impacting over 100 students.'
            }
        };
        setCvData(sampleData);
    };

    useEffect(() => {
        if (loading) { return; }
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user && !user.emailVerified) { router.push('/auth/verify-email'); return; }
        if (isSetupComplete) { return; }
        const cvIdFromUrl = searchParams.get('cvId');
        if (!cvIdFromUrl) { router.push('/dashboard'); return; }

        const setupCv = async () => {
            setPageState('LOADING');
            if (cvIdFromUrl === 'new') {
                const newId = `cv_${Date.now()}`;
                setCvId(newId);
                setCvName("Untitled CV");
                setCvData(getInitialCvData());
                setMode(null);
                setIsAiGenerated(false);
                setAiFlowStep(null);
                setPageState('READY');
                setIsSetupComplete(true);
            } else {
                try {
                    const userDocRef = doc(db, 'users', String(user.id));
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const allCvs = userDocSnap.data().cvs || [];
                        const specificCv = allCvs.find(cv => cv.id === cvIdFromUrl);
                        if (specificCv) {
                            setCvId(specificCv.id);
                            setCvName(specificCv.name);
                            const templateIdFromSaved = specificCv.cvData?.settings?.templateId;
                            const initialCvData = getInitialCvData(templateIdFromSaved);
                            const loadedCvData = { ...initialCvData, ...specificCv.cvData, settings: { ...initialCvData.settings, ...specificCv.cvData?.settings } };
                            const ensureHtml = (text) => {
                                if (!text) return '<p></p>';
                                if ((text.trim().startsWith('<') && text.trim().endsWith('>') && text.includes('/')) || text.trim() === '<p></p>') return text;
                                if (text.includes('\n- ') || text.includes('\n* ')) {
                                    const lines = text.split('\n');
                                    const ulContent = lines.map(line => { const trimmed = line.replace(/^[-*]\s*/, '').trim(); return trimmed ? `<li>${trimmed}</li>` : ''; }).filter(Boolean).join('');
                                    return ulContent ? `<ul>${ulContent}</ul>` : '<p></p>';
                                }
                                return `<p>${text}</p>`;
                            };
                            loadedCvData.summary = ensureHtml(loadedCvData.summary);
                            loadedCvData.experience = (loadedCvData.experience || []).map(exp => ({ ...exp, responsibilities: ensureHtml(exp.responsibilities), achievements: ensureHtml(exp.achievements) }));
                            loadedCvData.projects = (loadedCvData.projects || []).map(proj => ({ ...proj, description: ensureHtml(proj.description) }));
                            loadedCvData.customSections = (loadedCvData.customSections || []).map(section => ({ ...section, content: ensureHtml(section.content) }));
                            setCvData(loadedCvData);
                            const creationMethod = specificCv.creationMethod || 'manual';
                            setMode(creationMethod);
                            setIsAiGenerated(creationMethod === 'ai');
                            if (creationMethod === 'ai' && specificCv.cvData) { setAiFlowStep('editor'); }
                            else if (creationMethod === 'ai') { setAiFlowStep('templateSelection'); }
                            else { setAiFlowStep(null); }
                            setPageState('READY');
                            setIsSetupComplete(true);
                        } else { setErrorMessage("CV not found."); setPageState('ERROR'); }
                    } else { setErrorMessage("User profile not found."); setPageState('ERROR'); }
                } catch (error) {
                    console.error("Failed to load CV:", error);
                    setErrorMessage("Failed to load CV.");
                    setPageState('ERROR');
                }
            }
        };
        setupCv();
    }, [user, loading, isAuthenticated, searchParams, router, isSetupComplete]);

    const saveProgressToCloud = async () => {
        if (!user || !cvId || !cvData) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 2000);
            return;
        }
        setSaveStatus('saving');
        try {
            const { aiHelpers, ...cvDataToSave } = cvData;
            const userDocRef = doc(db, 'users', String(user.id));
            const userDocSnap = await getDoc(userDocRef);
            const existingCvs = userDocSnap.exists() ? userDocSnap.data().cvs || [] : [];
            const cvIndex = existingCvs.findIndex(cv => cv.id === cvId);
            const creationMethod = cvIndex > -1 ? existingCvs[cvIndex].creationMethod : mode;
            const newCvPayload = { id: cvId, name: cvName, updatedAt: new Date().toISOString(), cvData: cvDataToSave, creationMethod };
            if (cvIndex > -1) { existingCvs[cvIndex] = newCvPayload; }
            else { existingCvs.push(newCvPayload); }
            await setDoc(userDocRef, { cvs: existingCvs }, { merge: true });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(''), 2000); 
        } catch (error) {
            console.error("Save failed:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };

    const generateCvFromUserInput = async () => {
        setIsAiLoading(true);
        setErrorMessage('');
        const exp = cvData.experience?.[0] || {};
        const experienceRaw = `Job Title: ${exp.role || 'N/A'}. Company: ${exp.company || 'N/A'}. Location: ${exp.location || 'N/A'}. Dates: ${exp.startDate || 'N/A'} - ${exp.endDate || 'N/A'}. Achievements: ${exp.achievements || 'N/A'}`;
        const edu = cvData.education?.[0] || {};
        const educationRaw = `Degree: ${edu.degree || 'N/A'}. Institution: ${edu.institution || 'N/A'}. Graduation Year: ${edu.graduationYear || 'N/A'}. Location: ${edu.location || 'N/A'}.`;
        const { targetRole, jobDescription, referencesRaw, awardsRaw, coursesRaw, certificationsRaw, customSectionsRaw } = cvData.aiHelpers;
        const userInput = { personalInformation: { ...cvData.personalInformation }, summary: cvData.summary, experienceRaw, educationRaw, skills: cvData.skills, languages: cvData.languages, referencesRaw, awardsRaw, coursesRaw, certificationsRaw, customSectionsRaw };
        try {
            const parsedJson = await aiService.generateFullCv(userInput, targetRole, jobDescription);
            const ensureHtml = (text) => {
                if (!text) return '<p></p>';
                if (text.trim().startsWith('<') && text.trim().endsWith('>') && text.includes('/')) return text;
                if (text.includes('\n- ') || text.includes('\n* ')) {
                    const lines = text.split('\n');
                    const ulContent = lines.map(line => { const trimmed = line.replace(/^[-*]\s*/, '').trim(); return trimmed ? `<li>${trimmed}</li>` : ''; }).filter(Boolean).join('');
                    return ulContent ? `<ul>${ulContent}</ul>` : '<p></p>';
                }
                return `<p>${text}</p>`;
            };
            const updatedCvData = { 
                ...cvData, ...parsedJson, 
                personalInformation: { ...cvData.personalInformation, ...parsedJson.personalInformation },
                summary: ensureHtml(parsedJson.summary || cvData.summary), 
                experience: (parsedJson.experience || []).map(exp => ({ ...exp, responsibilities: ensureHtml(exp.responsibilities || ''), achievements: ensureHtml(exp.achievements || '') })),
                projects: (parsedJson.projects || []).map(proj => ({ ...proj, description: ensureHtml(proj.description || '') })),
                customSections: (parsedJson.customSections || []).map(section => ({ ...section, content: ensureHtml(section.content || '') })),
                languages: parsedJson.languages || cvData.languages, 
                references: parsedJson.references || [], awards: parsedJson.awards || [], courses: parsedJson.courses || [], certifications: parsedJson.certifications || [],
            };
            setCvData(updatedCvData); setMode('ai'); setIsAiGenerated(true); setAiFlowStep('editor'); 
        } catch (error) {
            setErrorMessage(`Error generating CV: ${error.message}`);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleChange = useCallback((e, dataKey, index) => {
        const { id, value } = e.target;
        setCvData(prev => {
            if (!prev) return prev;
            const newCvData = JSON.parse(JSON.stringify(prev));
            if (dataKey) {
                if (typeof index === 'number') {
                    if (!newCvData[dataKey]) newCvData[dataKey] = [];
                    if (!newCvData[dataKey][index]) newCvData[dataKey][index] = {};
                    newCvData[dataKey][index][id] = value;
                } else {
                    if (!newCvData[dataKey]) newCvData[dataKey] = {};
                    newCvData[dataKey][id] = value;
                }
            } else {
                newCvData[id] = value;
            }
            return newCvData;
        });
    }, []); 

    const handleSettingsChange = useCallback((id, value) => {
        setCvData(prev => ({ ...prev, settings: { ...prev.settings, [id]: value } }));
    }, []);

    const handleTemplateSelection = useCallback((templateId) => {
        const selectedTemplate = cvTemplates.find(t => t.id === templateId);
        if (selectedTemplate) {
            setCvData(prev => ({ ...prev, settings: { ...prev.settings, ...selectedTemplate.defaultSettings, templateId: templateId } }));
        }
    }, [cvTemplates]);

    const handleStartOver = () => {
        setPageState('LOADING'); setCvData(getInitialCvData()); setIsAiGenerated(false); setShowStartOverConfirm(false); setMode(null); setAiFlowStep(null); setPageState('READY');
    };

    const renderContent = () => {
        switch (pageState) {
            case 'LOADING': return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
            case 'ERROR': return <div className="text-center text-red-500">{errorMessage}</div>;
            case 'READY':
                if (!cvData) { return <div className="flex justify-center items-center h-screen"><Spinner /></div>; }
                if (!mode) {
                    const isPro = user && user.subscriptionStatus === 'active';
                    return (
                        <div className="text-center max-w-4xl mx-auto"><h1 className="text-4xl font-bold mb-4">Choose Your Path</h1><p className="text-gray-600 mb-8">How would you like to create this CV?</p><div className="flex flex-col md:flex-row gap-8"><div onClick={() => setMode('manual')} className="flex-1 p-8 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all"><h2 className="text-2xl font-bold mb-2">Manual Builder</h2><p className="text-gray-500">A simple, single-page form to build your CV.</p></div><div onClick={() => { if (isPro) { setMode('ai'); setAiFlowStep('templateSelection'); } else { router.push('/pricing'); } }} className="relative group flex-1 p-8 border-2 border-blue-500 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">{!isPro && (<div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">PRO</div>)}<h2 className="text-2xl font-bold mb-2 text-blue-600">Premium AI Builder</h2><p className="text-gray-500">Generate your CV with AI and edit it with a live preview.</p>{!isPro && (<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Requires a Pro subscription</div>)}</div></div></div>
                    );
                }
                if (mode === 'ai') {
                    if (aiFlowStep === 'templateSelection') { return ( <TemplateSelector templates={cvTemplates} selectedTemplateId={cvData.settings.templateId} onSelectTemplate={handleTemplateSelection} onNext={() => setAiFlowStep('questionnaire')} primaryColor={primaryColor} setPrimaryColor={(value) => handleSettingsChange('primaryColor', value)} setDividerColor={(value) => handleSettingsChange('dividerColor', value)} setFontSize={(value) => handleSettingsChange('paragraphFontSize', value)} setLineHeight={(value) => handleSettingsChange('lineHeight', value)} setFontFamily={(value) => handleSettingsChange('fontFamily', value)} /> ); }
                    else if (aiFlowStep === 'questionnaire') { 
                        return ( <AIQuestionnaire cvData={cvData} setCvData={setCvData} handleChange={handleChange} generateCvFromUserInput={generateCvFromUserInput} isAiLoading={isAiLoading} primaryColor={primaryColor} fillWithSampleData={fillWithSampleData} /> );
                    }
                    else if (aiFlowStep === 'editor') { return ( <AiCvEditor cvData={cvData} setCvData={setCvData} /> ); }
                }
                if (mode === 'manual') { return <ManualCvForm cvData={cvData} setCvData={setCvData} />; }
                return null;
            default: return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
        }
    };

    if (loading) { return <div className="flex justify-center items-center h-screen"><Spinner /></div>; }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            {pageState === 'READY' && cvData && (mode === 'ai' && isAiGenerated || mode === 'manual') && (
                <div className="mx-auto mb-6 flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200"><input type="text" value={cvName} onChange={(e) => setCvName(e.target.value)} className="text-2xl font-bold text-gray-800 border-b-2 border-transparent focus:border-blue-500 outline-none flex-grow" placeholder="Enter CV Name" /><div className="flex items-center gap-4 flex-wrap"><button onClick={saveProgressToCloud} disabled={saveStatus === 'saving'} className={`font-semibold py-2 px-4 rounded-lg shadow-md transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${ saveStatus === 'saving' ? 'bg-gray-400 text-white cursor-not-allowed' : saveStatus === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' : saveStatus === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white' }`}>{saveStatus === 'saving' && <ButtonSpinner />}{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save Progress'}</button><button onClick={handlePrint} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition whitespace-nowrap">Download PDF</button><Link href="/dashboard" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition whitespace-nowrap">Back to Dashboard</Link></div></div>
            )}
            <main className="mx-auto">{renderContent()}</main>
            <div style={{ position: 'fixed', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>{cvData && (<PrintableCv ref={componentToPrintRef} data={cvData} primaryColor={primaryColor} settings={cvData.settings} />)}</div>
            <ConfirmationModal isOpen={showStartOverConfirm} message="Are you sure you want to clear all data? This cannot be undone." onConfirm={handleStartOver} onCancel={() => setShowStartOverConfirm(false)} confirmText="Yes, Clear Data" />
        </div>
    );
};

export default function BuildPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading build page...</div>}>
            <CvBuilder />
        </Suspense>
    );
}
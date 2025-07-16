// src/app/build/page.js
"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useReactToPrint } from 'react-to-print';
import { aiService } from '@/services/aiService';

import ConfirmationModal from '@/components/common/ConfirmationModal';
import AiCvEditor from '@/components/cv/AiCvEditor';
import ManualCvForm from '@/components/cv/ManualCvForm';
import PrintableCv from '@/components/cv/PrintableCv';
import TemplateSelector from '@/components/cv/TemplateSelector';

const Spinner = () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>;

const AIQuestionnaire = ({ cvData, generateCvFromUserInput, isAiLoading, primaryColor, handleChange, fillWithSampleData }) => {
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
        { id: 'summary', question: "In one or two sentences, summarize your professional experience.", placeholder: "e.g., I'm a software engineer with over 8 years of experience building scalable web applications.", required: true, isTextarea: true },
        { id: 'experience', question: "Tell us about your most relevant job. (Role, Company, Achievements)", placeholder: "e.g., At TechCorp, as a Lead Dev, I designed and implemented a new CI/CD testing pipeline using Jenkins and Selenium, which decreased server costs by 20%...", isTextarea: true, required: true, dataKey: 'experience' },
        { id: 'technical', question: "List your key technical skills.", placeholder: "e.g., Java, Python, React, AWS, Docker", required: true, dataKey: 'skills' },
        { id: 'soft', question: "And what are your most important soft skills?", placeholder: "e.g., Team Leadership, Project Management, Communication", required: true, dataKey: 'skills' },
        { id: 'languages', question: "Which languages do you speak, and at what level? (e.g., English (Native), Spanish (Conversational))", placeholder: "e.g., English (Native), Spanish (Conversational)", optional: true, dataKey: null }, // MODIFIED: dataKey to null for top-level 'languages'
        { id: 'education', question: "What is your highest educational degree or certification?", placeholder: "e.g., M.Sc. in Computer Science from the University of Technology, 2019", required: true, dataKey: 'education' },
        { id: 'referencesRaw', question: "List any professional references. Include Name, Phone, and Position for each. (Optional)", placeholder: "e.g., John Doe, (123) 456-7890, Senior Manager at Acme Corp.; Jane Smith, (987) 654-3210, CTO at Beta Solutions.", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'awardsRaw', question: "Tell us about any awards or recognitions you've received. (Optional)", placeholder: "e.g., Employee of the Year 2023, Innovator Award 2022", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'coursesRaw', question: "List any relevant courses or online learning you've completed. (Optional)", placeholder: "e.g., Machine Learning Specialization, Coursera (2020); Certified ScrumMaster (Scrum Alliance, 2021).", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'certificationsRaw', question: "Include any professional certifications you hold. (Optional)", placeholder: "e.g., AWS Certified Solutions Architect (2023); PMP (2021).", isTextarea: true, optional: true, dataKey: 'aiHelpers' },
        { id: 'customSectionsRaw', question: "Do you have other information like volunteer work or publications? Specify a header and content. (Optional)", placeholder: "Format: 'Header: Content'. e.g., 'Volunteer Work: Mentored junior developers at Code for Good Foundation (2020-2023).' or 'Publications: Article on AI Ethics, Journal of Tech (2022).'", isTextarea: true, optional: true, dataKey: 'aiHelpers' }
    ];
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const nextQuestion = () => { if (currentQuestionIndex < aiQuestions.length - 1) { setCurrentQuestionIndex(prev => prev + 1); } };
    const prevQuestion = () => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(prev => prev - 1); } };
    const currentQuestion = aiQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / aiQuestions.length) * 100;
    
    let currentValue = '';
    if (cvData) {
        if (currentQuestion.dataKey) {
            if (['experience', 'education'].includes(currentQuestion.dataKey)) {
                currentValue = cvData[currentQuestion.dataKey]?.[0]?.rawInput || '';
            } else {
                currentValue = cvData[currentQuestion.dataKey]?.[currentQuestion.id] || '';
            }
        } else {
            // For top-level fields like 'summary', 'languages'
            currentValue = cvData[currentQuestion.id] || '';
        }
    }
    
    const handleInputChange = (e) => {
        if (currentQuestion.dataKey === 'experience' || currentQuestion.dataKey === 'education') {
            handleChange({ target: { id: 'rawInput', value: e.target.value } }, currentQuestion.dataKey, 0);
        } else {
            handleChange(e, currentQuestion.dataKey); // `dataKey` null handles top-level fields
        }
    };
    
    const inputElement = (
        <textarea 
            id={currentQuestion.id} 
            rows={currentQuestion.isTextarea ? 8 : 4} 
            value={currentValue} 
            onChange={handleInputChange} 
            placeholder={currentQuestion.placeholder} 
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" 
        />
    );
    
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-center mb-2">AI-Powered CV Builder</h2>
                <button onClick={fillWithSampleData} className="text-xs bg-purple-100 text-purple-700 py-1 px-2 rounded-md hover:bg-purple-200">Fill Sample</button>
            </div>
            <p className="text-center text-gray-500 mb-6">Answer these simple questions, and our AI will write your CV. All changes are auto-saved.</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="h-2 rounded-full" style={{ width: `${progress}%`, backgroundColor: primaryColor, transition: 'width 0.3s ease-in-out' }}></div>
            </div>
            <div className="mb-6">
                <label htmlFor={currentQuestion.id} className="block text-lg font-medium text-gray-800 mb-3">
                    {currentQuestion.question}
                    {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                    {currentQuestion.optional && <span className="text-gray-400 text-sm ml-2">(Optional)</span>}
                </label>
                {inputElement}
            </div>
            <div className="flex justify-between items-center">
                <button 
                    onClick={prevQuestion} 
                    disabled={currentQuestionIndex === 0} 
                    className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                    Previous
                </button>
                {currentQuestionIndex < aiQuestions.length - 1 ? (
                    <button 
                        onClick={nextQuestion} 
                        className="py-2 px-4 text-sm font-medium rounded-md text-white" 
                        style={{ backgroundColor: primaryColor }}
                    >
                        Next
                    </button>
                ) : (
                    <button 
                        onClick={generateCvFromUserInput} 
                        disabled={isAiLoading} 
                        className="py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {isAiLoading ? 'Generating...' : 'Generate CV with AI'}
                    </button>
                )}
            </div>
        </div>
    );
};

const CvBuilder = () => {
    // Define your templates
    const cvTemplates = [
        {
            id: 'modern',
            name: 'Modern Minimalist',
            imageUrl: '/images/templates/modern.png', // Placeholder image
            defaultSettings: {
                primaryColor: '#007BFF', // Blue
                dividerColor: '#e0e0e0',
                paragraphFontSize: '11pt', // MODIFIED
                headerFontSize: '14pt',     // NEW
                lineHeight: '1.4',
                fontFamily: 'Inter, sans-serif'
            }
        },
        {
            id: 'classic',
            name: 'Classic Professional',
            imageUrl: '/images/templates/classic.png', // Placeholder image
            defaultSettings: {
                primaryColor: '#333333', // Dark Gray
                dividerColor: '#cccccc',
                paragraphFontSize: '10.5pt', // MODIFIED
                headerFontSize: '13.5pt',     // NEW
                lineHeight: '1.5',
                fontFamily: 'Merriweather, serif' // More traditional font
            }
        },
        {
            id: 'elegant',
            name: 'Elegant Serenity',
            imageUrl: '/images/templates/elegant.png', // Placeholder image
            defaultSettings: {
                primaryColor: '#8E44AD', // Purple
                dividerColor: '#d8bfd8',
                paragraphFontSize: '11pt', // MODIFIED
                headerFontSize: '15pt',     // NEW
                lineHeight: '1.4',
                fontFamily: 'Open Sans, sans-serif'
            }
        },
        {
            id: 'bold',
            name: 'Bold & Impactful',
            imageUrl: '/images/templates/professional.png', // Placeholder image
            defaultSettings: {
                primaryColor: '#D9534F', // Red
                dividerColor: '#f2dede',
                paragraphFontSize: '12pt', // MODIFIED
                headerFontSize: '16pt',     // NEW
                lineHeight: '1.3',
                fontFamily: 'Montserrat, sans-serif'
            }
        },
        {
            id: 'creative',
            name: 'Creative Flair',
            imageUrl: '/images/templates/creative.png', // Placeholder image
            defaultSettings: {
                primaryColor: '#28A745', // Green
                dividerColor: '#d4edda',
                paragraphFontSize: '10pt', // MODIFIED
                headerFontSize: '13pt',     // NEW
                lineHeight: '1.6',
                fontFamily: 'Lato, sans-serif'
            }
        },
        {
            id: 'minimalist',
            name: 'Clean & Simple',
            imageUrl: '/images/templates/minimalist.png', // Placeholder image
            defaultSettings: {
                primaryColor: '#6C757D', // Muted Gray
                dividerColor: '#e9ecef',
                paragraphFontSize: '11.5pt', // MODIFIED
                headerFontSize: '14.5pt',     // NEW
                lineHeight: '1.45',
                fontFamily: 'Roboto, sans-serif'
            }
        }
    ];

    const getInitialCvData = (templateId = null) => {
        let initialSettings = {
            primaryColor: '#2563EB',
            dividerColor: '#e0e0e0',
            paragraphFontSize: '11pt', // MODIFIED: base paragraph font size
            headerFontSize: '14pt', // NEW: base header font size
            lineHeight: '1.4',
            fontFamily: 'Inter, sans-serif',
            templateId: templateId || 'modern',
            sectionOrder: [
                'summary',
                'experience',
                'education',
                'projects', // Keeping projects in default order now
                'skills',
                'languages', // NEW: Languages as a separate section
                'references',
                'awards',
                'courses',
                'certifications',
                'customSections'
            ]
        };

        if (templateId) {
            const selectedTemplate = cvTemplates.find(t => t.id === templateId);
            if (selectedTemplate) {
                initialSettings = { ...initialSettings, ...selectedTemplate.defaultSettings, templateId: templateId };
            }
        }

        return {
            personalInformation: { name: '', professionalTitle: '', email: '', phone: '', linkedin: '', city: '', country: '', portfolioLink: '', contact: '' },
            summary: '', 
            experience: [], 
            education: [], 
            projects: [],
            skills: { technical: '', soft: '' }, // MODIFIED: removed languages from here
            languages: '', // NEW: languages as a top-level property
            references: [],
            awards: [],
            courses: [],
            certifications: [],
            customSections: [],
            settings: initialSettings,
            aiHelpers: {
                targetRole: '', 
                jobDescription: '', 
                referencesRaw: '',
                awardsRaw: '',
                coursesRaw: '',
                certificationsRaw: '',
                customSectionsRaw: ''
            },
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

    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const componentToPrintRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentToPrintRef.current,
        documentTitle: `${cvName.replace(/\s/g, '_') || 'My_CV'}`,
        onPrintError: (error) => console.error("Error printing:", error),
        pageStyle: `
            @page {
                size: A4;
                margin: 1cm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `
    });

    const fillWithSampleData = () => {
        setCvData(prev => ({
            ...prev,
            personalInformation: { 
                name: 'Qusai Ahmad', 
                professionalTitle: 'Senior QA Automation Engineer',
                email: 'qusai.ahmad@email.com', 
                phone: '(123) 456-7890', 
                linkedin: 'linkedin.com/in/q-ahmad', 
                city: 'Amman', 
                country: 'Jordan', 
                portfolioLink: 'github.com/q-ahmad',
                contact: 'qusai.ahmad@email.com | (123) 456-7890 | linkedin.com/in/q-ahmad'
            },
            summary: 'A Senior QA Automation Engineer with over 7 years of experience specializing in building robust testing frameworks for web and mobile applications.',
            experience: [{ 
                rawInput: 'At Innovate Solutions, as a Test Lead, I designed and implemented a new CI/CD testing pipeline using Jenkins and Selenium, which decreased bug detection time by 40%. Leading a team of 5 QA engineers, I improved test coverage by 30% for our flagship product. Collaborated with development teams to integrate testing earlier in the SDLC.' 
            }],
            education: [{ 
                rawInput: 'B.Sc. in Software Engineering from the Hashemite University, 2019. Courses included Data Structures, Algorithms, Software Testing, Database Systems.' 
            }],
            projects: [],
            skills: { 
                technical: 'Java, Selenium, Cypress, Appium, SQL, Postman, Jira, Jenkins, GitLab CI/CD, Agile Methodologies, TestRail', 
                soft: 'Critical Thinking, Communication, Mentorship, Problem-solving, Team Leadership, Adaptability'
            }, // MODIFIED: removed languages
            languages: 'English (Fluent), Arabic (Native)', // NEW: top-level languages
            aiHelpers: { 
                targetRole: 'Senior QA Automation Engineer', 
                jobDescription: 'We are seeking a Senior QA Automation Engineer with extensive experience in creating testing frameworks from scratch. Must be proficient in Cypress and/or Selenium, have strong Java skills, and be able to work with CI/CD pipelines like Jenkins. Experience with API testing using Postman is a plus. Candidates should demonstrate strong leadership and problem-solving skills.', 
                referencesRaw: 'Professor Jane Smith, (555) 123-4567, Head of CS Dept. at Hashemite University; Dr. Alex Chen, (555) 987-6543, Engineering Director at Innovate Solutions.',
                awardsRaw: 'Innovator of the Year Award (2023), recognized at Tech Solutions Annual Gala for developing a groundbreaking test automation tool. Employee Recognition for Outstanding Performance (Q4 2022), Innovate Solutions, for significant contributions to project success.',
                coursesRaw: 'Advanced Selenium WebDriver (Udemy, 2022); Certified ScrumMaster (Scrum Alliance, 2021); API Testing with Postman (LinkedIn Learning, 2020).',
                certificationsRaw: 'ISTQB Advanced Level Test Automation Engineer (2021); Certified Kubernetes Administrator (CKA, 2020).',
                customSectionsRaw: 'Volunteer Work: Led weekly coding workshops for underprivileged youth (2020-2023), Code for Good Foundation, impacting over 100 students. Publications: Co-authored "Effective Strategies for CI/CD in Agile QA," presented at Global Tech Conference 2023.'
            },
            references: [],
            awards: [],
            courses: [],
            certifications: [],
            customSections: [],
        }));
    };

    useEffect(() => {
        if (loading) {
            return;
        }
        if (!user) {
            router.push('/login');
            return;
        }

        const cvIdFromUrl = searchParams.get('cvId');
        if (!cvIdFromUrl) {
            router.push('/dashboard');
            return;
        }

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

                            setCvData({ 
                                ...initialCvData, 
                                ...specificCv.cvData, 
                                // Deep merge for settings to ensure new defaults like sectionOrder are applied
                                // but existing specific values take precedence.
                                settings: { 
                                    ...initialCvData.settings,
                                    ...specificCv.cvData?.settings
                                }
                            });
                            const creationMethod = specificCv.creationMethod || 'manual';
                            setMode(creationMethod);
                            setIsAiGenerated(creationMethod === 'ai');
                            if (creationMethod === 'ai' && specificCv.cvData) {
                                setAiFlowStep('editor');
                            } else if (creationMethod === 'ai') { 
                                setAiFlowStep('templateSelection'); 
                            } else {
                                setAiFlowStep(null);
                            }
                            setPageState('READY');
                        } else {
                            setErrorMessage("CV not found.");
                            setPageState('ERROR');
                        }
                    } else {
                        setErrorMessage("User profile not found.");
                        setPageState('ERROR');
                    }
                } catch (error) {
                    console.error("Failed to load CV:", error);
                    setErrorMessage("Failed to load CV.");
                    setPageState('ERROR');
                }
            }
        };
        setupCv();
    }, [user, loading, searchParams, router]);

    const saveProgressToCloud = useCallback(async (dataToSave, nameOfCv) => {
        if (!user || !cvId) { return; }
        try {
            const { aiHelpers, ...cvDataToSave } = dataToSave; 
            const userDocRef = doc(db, 'users', String(user.id));
            const userDocSnap = await getDoc(userDocRef);
            const existingCvs = userDocSnap.exists() ? userDocSnap.data().cvs || [] : [];
            const cvIndex = existingCvs.findIndex(cv => cv.id === cvId);
            const creationMethod = cvIndex > -1 ? existingCvs[cvIndex].creationMethod : mode;
            
            const newCvPayload = { 
                id: cvId, 
                name: nameOfCv, 
                updatedAt: new Date().toISOString(), 
                cvData: cvDataToSave, 
                creationMethod 
            };
            if (cvIndex > -1) {
                existingCvs[cvIndex] = newCvPayload;
            } else {
                existingCvs.push(newCvPayload);
            }
            await setDoc(userDocRef, { cvs: existingCvs }, { merge: true });
        } catch (error) {
            console.error("Autosave failed:", error);
        }
    }, [user, cvId, mode]);

    const debouncedCvData = useDebounce(cvData, 3000);
    useEffect(() => {
        if (pageState === 'READY' && mode && cvData && cvId) {
            saveProgressToCloud(cvData, cvName);
        }
    }, [debouncedCvData, cvName, pageState, mode, cvData, cvId, saveProgressToCloud]);

    const generateCvFromUserInput = async () => {
        setIsAiLoading(true);
        setErrorMessage('');
        const { targetRole, jobDescription, referencesRaw, awardsRaw, coursesRaw, certificationsRaw, customSectionsRaw } = cvData.aiHelpers;
        const userInput = {
            personalInformation: { ...cvData.personalInformation, professionalTitle: cvData.personalInformation.professionalTitle },
            summary: cvData.summary,
            experienceRaw: cvData.experience[0]?.rawInput, 
            educationRaw: cvData.education[0]?.rawInput,
            skills: cvData.skills, 
            languages: cvData.languages, // NEW: pass top-level languages
            referencesRaw: referencesRaw,
            awardsRaw: awardsRaw,
            coursesRaw: coursesRaw,
            certificationsRaw: certificationsRaw,
            customSectionsRaw: customSectionsRaw
        };
        try {
            const parsedJson = await aiService.generateFullCv(userInput, targetRole, jobDescription);
            const updatedCvData = { 
                ...cvData, 
                ...parsedJson, 
                personalInformation: { 
                    ...cvData.personalInformation, 
                    ...parsedJson.personalInformation
                },
                // Ensure top-level languages is updated if AI returns it (unlikely for raw input but good for consistency)
                languages: parsedJson.languages || cvData.languages, 
                references: parsedJson.references || [],
                awards: parsedJson.awards || [],
                courses: parsedJson.courses || [],
                certifications: parsedJson.certifications || [],
                customSections: parsedJson.customSections || [],
            };
            setCvData(updatedCvData);
            setMode('ai'); 
            setIsAiGenerated(true); 
            setAiFlowStep('editor'); 
        } catch (error) {
            setErrorMessage(`Error generating CV: ${error.message}`);
        }
        finally {
            setIsAiLoading(false);
        }
    };

    const handleChange = useCallback((e, dataKey, index) => {
        const { id, value } = e.target;
        setCvData(prev => {
            if (!prev) return prev; 
            const newCvData = JSON.parse(JSON.stringify(prev));
            if (dataKey) { // For nested objects like personalInformation, skills, aiHelpers
                if (typeof index === 'number') { // For arrays of objects like experience, education
                    if (!newCvData[dataKey]) newCvData[dataKey] = [];
                    if (!newCvData[dataKey][index]) newCvData[dataKey][index] = {};
                    newCvData[dataKey][index][id] = value;
                } else { // For direct properties of dataKey object
                    if (!newCvData[dataKey]) newCvData[dataKey] = {};
                    newCvData[dataKey][id] = value;
                }
            } else { // For top-level properties like summary, languages
                newCvData[id] = value;
            }
            return newCvData;
        });
    }, []); 

    const handleSettingsChange = useCallback((id, value) => {
        setCvData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [id]: value
            }
        }));
    }, []);

    const handleTemplateSelection = useCallback((templateId) => {
        const selectedTemplate = cvTemplates.find(t => t.id === templateId);
        if (selectedTemplate) {
            setCvData(prev => ({
                ...prev,
                settings: {
                    ...prev.settings,
                    ...selectedTemplate.defaultSettings,
                    templateId: templateId
                }
            }));
        }
    }, [cvTemplates]);

    const handleStartOver = () => {
        setPageState('LOADING');
        setCvData(getInitialCvData()); 
        setIsAiGenerated(false);
        setShowStartOverConfirm(false);
        setMode(null); 
        setAiFlowStep(null); 
        setPageState('READY');
    };

    const renderContent = () => {
        switch (pageState) {
            case 'LOADING':
                return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
            case 'ERROR':
                return <div className="text-center text-red-500">{errorMessage}</div>;
            case 'READY':
                if (!cvData) {
                    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
                }
                if (!mode) {
                    return (
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-4xl font-bold mb-4">Choose Your Path</h1>
                            <p className="text-gray-600 mb-8">How would you like to create this CV?</p>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div 
                                    onClick={() => setMode('manual')} 
                                    className="flex-1 p-8 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all"
                                >
                                    <h2 className="text-2xl font-bold mb-2">Manual Builder</h2>
                                    <p className="text-gray-500">A simple, single-page form to build your CV.</p>
                                </div>
                                <div 
                                    onClick={() => { setMode('ai'); setAiFlowStep('templateSelection'); }} 
                                    className="flex-1 p-8 border-2 border-blue-500 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-all"
                                >
                                    <h2 className="text-2xl font-bold mb-2 text-blue-600">Premium AI Builder</h2>
                                    <p className="text-gray-500">Generate your CV with AI and edit it with a live preview.</p>
                                </div>
                            </div>
                        </div>
                    );
                }
                if (mode === 'ai') {
                    if (aiFlowStep === 'templateSelection') {
                        return (
                            <TemplateSelector
                                templates={cvTemplates}
                                selectedTemplateId={cvData.settings.templateId}
                                onSelectTemplate={handleTemplateSelection}
                                onNext={() => setAiFlowStep('questionnaire')}
                                primaryColor={primaryColor}
                                setPrimaryColor={(value) => handleSettingsChange('primaryColor', value)}
                                setDividerColor={(value) => handleSettingsChange('dividerColor', value)}
                                setFontSize={(value) => handleSettingsChange('paragraphFontSize', value)} // Pass paragraph font size
                                setLineHeight={(value) => handleSettingsChange('lineHeight', value)}
                                setFontFamily={(value) => handleSettingsChange('fontFamily', value)}
                            />
                        );
                    } else if (aiFlowStep === 'questionnaire') {
                        return (
                            <AIQuestionnaire
                                cvData={cvData}
                                generateCvFromUserInput={generateCvFromUserInput}
                                isAiLoading={isAiLoading}
                                primaryColor={primaryColor}
                                handleChange={handleChange}
                                fillWithSampleData={fillWithSampleData}
                            />
                        );
                    } else if (aiFlowStep === 'editor') {
                        return (
                            <AiCvEditor 
                                cvData={cvData} 
                                setCvData={setCvData} 
                            />
                        );
                    }
                }
                if (mode === 'manual') {
                    return <ManualCvForm cvData={cvData} setCvData={setCvData} />;
                }
                return null;
            default:
                return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            {pageState === 'READY' && cvData && (mode === 'ai' && isAiGenerated || mode === 'manual') && (
                <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <input 
                        type="text" 
                        value={cvName} 
                        onChange={(e) => setCvName(e.target.value)} 
                        className="text-2xl font-bold text-gray-800 border-b-2 border-transparent focus:border-blue-500 outline-none flex-grow" 
                        placeholder="Enter CV Name" 
                    />
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePrint}
                            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition whitespace-nowrap"
                        >
                            Download PDF
                        </button>
                        <Link 
                            href="/dashboard" 
                            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition whitespace-nowrap"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto">
                {renderContent()}
            </main>

            <div style={{ position: 'fixed', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
                {cvData && (
                    <PrintableCv 
                        ref={componentToPrintRef} 
                        data={cvData} 
                        primaryColor={primaryColor} 
                        settings={cvData.settings} 
                    />
                )}
            </div>
            
            <ConfirmationModal 
                isOpen={showStartOverConfirm} 
                message="Are you sure you want to clear all data? This cannot be undone." 
                onConfirm={handleStartOver} 
                onCancel={() => setShowStartOverConfirm(false)} 
                confirmText="Yes, Clear Data" 
            />
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
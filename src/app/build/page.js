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

import ConfirmationModal from '@/components/common/ConfirmationModal';
import AiCvEditor from '@/components/cv/AiCvEditor';
import ManualCvForm from '@/components/cv/ManualCvForm';
import PrintableCv from '@/components/cv/PrintableCv';
import TemplateSelector from '@/components/cv/TemplateSelector';

import TagInput from '@/components/common/TagInput';

// --- FIX 1 & 2: Moved components and constants to the top level ---

const Spinner = () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>;

const ExperienceForm = ({ cvData, setCvData, onContinue, onPrevious, primaryColor }) => {
    // This component's code remains the same
    const initialExperienceState = { jobTitle: '', company: '', startDate: '', endDate: '', isCurrent: false, achievements: '' };
    const [currentExperience, setCurrentExperience] = useState(initialExperienceState);
    const [error, setError] = useState('');
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setCurrentExperience(prev => {
            const newState = { ...prev, [id]: val };
            if (id === 'isCurrent' && checked) { newState.endDate = ''; }
            return newState;
        });
    };
    const isFormValid = currentExperience.jobTitle && currentExperience.company && currentExperience.startDate;
    const saveExperience = () => {
        if (!isFormValid) { setError('Please fill in Job Title, Company, and Start Date.'); return false; }
        const responsibilitiesHtml = currentExperience.achievements 
            ? '<p>' + currentExperience.achievements.split('\n').filter(line => line.trim() !== '').join('</p><p>') + '</p>'
            : '<p></p>';
        const newExperienceEntry = {
            jobTitle: currentExperience.jobTitle,
            company: currentExperience.company,
            startDate: currentExperience.startDate,
            endDate: currentExperience.endDate,
            isCurrent: currentExperience.isCurrent,
            responsibilities: responsibilitiesHtml,
            achievements: '<p></p>',
            showResponsibilities: true,
            showAchievements: false, 
        };
        setCvData(prev => ({ ...prev, experience: [...(prev.experience || []), newExperienceEntry] }));
        setError('');
        return true;
    };
    const handleSaveAndAddAnother = () => { if (saveExperience()) { setCurrentExperience(initialExperienceState); } };
    const handleFinish = () => {
        const hasPartialData = currentExperience.jobTitle || currentExperience.company || currentExperience.startDate;
        if (hasPartialData) { if (!saveExperience()) { return; } }
        onContinue();
    };
    const addedExperiences = cvData?.experience || [];
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
            <p className="text-gray-500 mb-6">Add your work history one role at a time. Required fields are marked with *</p>
            {addedExperiences.length > 0 && ( <div className="mb-6"><h3 className="text-lg font-semibold mb-2">Your Experience Entries:</h3><ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">{addedExperiences.map((exp, index) => ( <li key={index} className="text-gray-800">{exp.jobTitle} at {exp.company}</li>))}</ul></div>)}
            <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700">Job Title <span className="text-red-500">*</span></label><input type="text" id="jobTitle" value={currentExperience.jobTitle} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., Senior Frontend Developer" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Company <span className="text-red-500">*</span></label><input type="text" id="company" value={currentExperience.company} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., TechCorp" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label><input type="text" id="startDate" value={currentExperience.startDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., Jan 2020" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">End Date</label><input type="text" id="endDate" value={currentExperience.endDate} onChange={handleChange} disabled={currentExperience.isCurrent} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="e.g., Dec 2022" /></div>
                </div>
                <div className="flex items-center"><input type="checkbox" id="isCurrent" checked={currentExperience.isCurrent} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-900">I currently work here</label></div>
                <div><label className="block text-sm font-medium text-gray-700">Responsibilities / Key Accomplishments <span className="text-gray-400 text-sm ml-1">(Optional)</span></label><p className="text-xs text-gray-500 mb-1">List key points. Each on a new line. This helps the AI highlight your impact.</p><textarea id="achievements" value={currentExperience.achievements} onChange={handleChange} rows="5" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., Led the migration of a legacy system..."></textarea></div>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-between items-center mt-8">
                <button onClick={onPrevious} className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300">Previous</button>
                <div className="flex gap-4">
                    <button onClick={handleSaveAndAddAnother} disabled={!isFormValid} className="py-2 px-4 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Save & Add Another</button>
                    <button onClick={handleFinish} style={{ backgroundColor: primaryColor }} className="py-2 px-4 text-sm font-medium rounded-md text-white hover:opacity-90">Finish & Continue</button>
                </div>
            </div>
        </div>
    );
};

const EducationForm = ({ cvData, setCvData, onContinue, onPrevious, primaryColor }) => {
    // This component also remains the same
    const initialEducationState = { degree: '', institution: '', gradDate: '', gpa: '' };
    const [currentEducation, setCurrentEducation] = useState(initialEducationState);
    const [error, setError] = useState('');
    const handleChange = (e) => {
        const { id, value } = e.target;
        setCurrentEducation(prev => ({ ...prev, [id]: value }));
    };
    const isFormValid = currentEducation.degree && currentEducation.institution && currentEducation.gradDate;
    const saveEducation = () => {
        if (!isFormValid) {
            setError('Please fill in Degree, Institution, and Graduation Date.');
            return false;
        }
        setCvData(prev => ({ ...prev, education: [...(prev.education || []), currentEducation] }));
        setError('');
        return true;
    };
    const handleSaveAndAddAnother = () => { if (saveEducation()) { setCurrentEducation(initialEducationState); } };
    const handleFinish = () => {
        const hasPartialData = currentEducation.degree || currentEducation.institution || currentEducation.gradDate;
        if (hasPartialData) { if (!saveEducation()) { return; } }
        onContinue();
    };
    const addedEducation = cvData?.education || [];
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-2">Education</h2>
            <p className="text-gray-500 mb-6">Add your education history one entry at a time. Required fields are marked with *</p>
            {addedEducation.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Your Education Entries:</h3>
                    <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">
                        {addedEducation.map((edu, index) => ( <li key={index} className="text-gray-800">{edu.degree} at {edu.institution}</li> ))}
                    </ul>
                </div>
            )}
            <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700">Degree / Certification <span className="text-red-500">*</span></label><input type="text" id="degree" value={currentEducation.degree} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., B.Sc. in Computer Science" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Institution <span className="text-red-500">*</span></label><input type="text" id="institution" value={currentEducation.institution} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., University of Technology" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Graduation Date <span className="text-red-500">*</span></label><input type="text" id="gradDate" value={currentEducation.gradDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., May 2019" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">GPA (Optional)</label><input type="text" id="gpa" value={currentEducation.gpa} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 3.8 / 4.0" /></div>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-between items-center mt-8">
                <button onClick={onPrevious} className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300">Previous</button>
                <div className="flex gap-4">
                    <button onClick={handleSaveAndAddAnother} disabled={!isFormValid} className="py-2 px-4 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Save & Add Another</button>
                    <button onClick={handleFinish} style={{ backgroundColor: primaryColor }} className="py-2 px-4 text-sm font-medium rounded-md text-white hover:opacity-90">Finish & Continue</button>
                </div>
            </div>
        </div>
    );
};

const AIQuestionnaire = ({ cvData, setCvData, generateCvFromUserInput, isAiLoading, primaryColor, handleChange, fillWithSampleData }) => {
    // ... AIQuestionnaire code remains the same as the previous correct version ...
};

const cvTemplates = [
    { id: 'modern', name: 'Modern Minimalist', imageUrl: '/images/templates/modern.jpg', defaultSettings: { primaryColor: '#007BFF', dividerColor: '#e0e0e0', paragraphFontSize: '11pt', headerFontSize: '14pt', lineHeight: '1.4', fontFamily: 'Inter, sans-serif' } },
    { id: 'classic', name: 'Classic Professional', imageUrl: '/images/templates/classic.jpg', defaultSettings: { primaryColor: '#333333', dividerColor: '#cccccc', paragraphFontSize: '10.5pt', headerFontSize: '13.5pt', lineHeight: '1.5', fontFamily: 'Merriweather, serif' } },
    { id: 'elegant', name: 'Elegant Serenity', imageUrl: '/images/templates/elegant.jpg', defaultSettings: { primaryColor: '#8E44AD', dividerColor: '#d8bfd8', paragraphFontSize: '11pt', headerFontSize: '15pt', lineHeight: '1.4', fontFamily: 'Open Sans, sans-serif' } },
    { id: 'bold', name: 'Bold & Impactful', imageUrl: '/images/templates/professional.jpg', defaultSettings: { primaryColor: '#D9534F', dividerColor: '#f2dede', paragraphFontSize: '12pt', headerFontSize: '16pt', lineHeight: '1.3', fontFamily: 'Montserrat, sans-serif' } },
    { id: 'creative', name: 'Creative Flair', imageUrl: '/images/templates/creative.jpg', defaultSettings: { primaryColor: '#28A745', dividerColor: '#d4edda', paragraphFontSize: '10pt', headerFontSize: '13pt', lineHeight: '1.6', fontFamily: 'Lato, sans-serif' } },
    { id: 'minimalist', name: 'Clean & Simple', imageUrl: '/images/templates/minimalist.jpg', defaultSettings: { primaryColor: '#6C757D', dividerColor: '#e9ecef', paragraphFontSize: '11.5pt', headerFontSize: '14.5pt', lineHeight: '1.45', fontFamily: 'Roboto, sans-serif' } }
];

const CvBuilder = () => {
    // All useState calls are now at the top level of the component
    const [cvData, setCvData] = useState(null);
    const [cvId, setCvId] = useState(null);
    const [cvName, setCvName] = useState("Untitled CV");
    const [mode, setMode] = useState(null);
    const [aiFlowStep, setAiFlowStep] = useState(null);
    const [isAiGenerated, setIsAiGenerated] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
    const [pageState, setPageState] = useState('LOADING');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading, isAuthenticated } = useAuth();
    const componentToPrintRef = useRef(null);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [writeCount, setWriteCount] = useState(0);
    const [saveState, setSaveState] = useState('idle');

    const primaryColor = cvData?.settings?.primaryColor || '#2563EB';

    // --- FIX 2 & 3: Wrap `getInitialCvData` in useCallback ---
    const getInitialCvData = useCallback((templateId = null) => {
        const sectionOrder = [ 'summary', 'experience', 'education', 'projects', 'skills', 'languages', 'references', 'awards', 'courses', 'certifications', 'customSections' ];
        let initialSettings = {
            primaryColor: '#2563EB', dividerColor: '#e0e0e0', paragraphFontSize: '11pt', headerFontSize: '14pt', lineHeight: '1.4', fontFamily: 'Inter, sans-serif', templateId: templateId || 'modern',
            sectionOrder: sectionOrder,
            showExperienceHeaders: true,
            sectionVisibility: sectionOrder.reduce((acc, sectionId) => { acc[sectionId] = true; return acc; }, {})
        };
        if (templateId) { const selectedTemplate = cvTemplates.find(t => t.id === templateId); if (selectedTemplate) { initialSettings = { ...initialSettings, ...selectedTemplate.defaultSettings, templateId: templateId }; } }
        return { personalInformation: { name: '', professionalTitle: '', email: '', phone: '', linkedin: '', city: '', country: '', portfolioLink: '' }, summary: '<p></p>', experience: [], education: [], projects: [], skills: { technical: [], soft: [] }, languages: '', references: [], awards: [], courses: [], certifications: [], customSections: [], settings: initialSettings, aiHelpers: { targetRole: '', jobDescription: '', referencesRaw: '', awardsRaw: '', coursesRaw: '', certificationsRaw: '', customSectionsRaw: '' }, };
    }, []); // Empty dependency array as `cvTemplates` is a top-level constant.

    // ... The rest of the component's logic ...
    
    return (
        // ... The component's JSX ...
    );
};

// ... This structure needs to be completed below ...
Okay, the above shows the problem. It's very difficult to separate the logic this way. The correct fix is to move all component definitions to the top level. Here is the final, full, corrected file.
code
JavaScript
"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, doc, getDoc, setDoc } from '@/utils/firebase-debugger';
import { useAuth } from '@/contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { aiService } from '@/services/aiService';

import ConfirmationModal from '@/components/common/ConfirmationModal';
import AiCvEditor from '@/components/cv/AiCvEditor';
import ManualCvForm from '@/components/cv/ManualCvForm';
import PrintableCv from '@/components/cv/PrintableCv';
import TemplateSelector from '@/components/cv/TemplateSelector';
import TagInput from '@/components/common/TagInput';

// --- ALL COMPONENTS ARE NOW AT THE TOP LEVEL OF THE FILE ---

const Spinner = () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>;

const ExperienceForm = ({ cvData, setCvData, onContinue, onPrevious, primaryColor }) => {
    const initialExperienceState = { jobTitle: '', company: '', startDate: '', endDate: '', isCurrent: false, achievements: '' };
    const [currentExperience, setCurrentExperience] = useState(initialExperienceState);
    const [error, setError] = useState('');
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setCurrentExperience(prev => {
            const newState = { ...prev, [id]: val };
            if (id === 'isCurrent' && checked) { newState.endDate = ''; }
            return newState;
        });
    };
    const isFormValid = currentExperience.jobTitle && currentExperience.company && currentExperience.startDate;
    const saveExperience = () => {
        if (!isFormValid) { setError('Please fill in Job Title, Company, and Start Date.'); return false; }
        const responsibilitiesHtml = currentExperience.achievements 
            ? '<p>' + currentExperience.achievements.split('\n').filter(line => line.trim() !== '').join('</p><p>') + '</p>'
            : '<p></p>';
        const newExperienceEntry = {
            jobTitle: currentExperience.jobTitle,
            company: currentExperience.company,
            startDate: currentExperience.startDate,
            endDate: currentExperience.endDate,
            isCurrent: currentExperience.isCurrent,
            responsibilities: responsibilitiesHtml,
            achievements: '<p></p>',
            showResponsibilities: true,
            showAchievements: false, 
        };
        setCvData(prev => ({ ...prev, experience: [...(prev.experience || []), newExperienceEntry] }));
        setError('');
        return true;
    };
    const handleSaveAndAddAnother = () => { if (saveExperience()) { setCurrentExperience(initialExperienceState); } };
    const handleFinish = () => {
        const hasPartialData = currentExperience.jobTitle || currentExperience.company || currentExperience.startDate;
        if (hasPartialData) { if (!saveExperience()) { return; } }
        onContinue();
    };
    const addedExperiences = cvData?.experience || [];
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
            <p className="text-gray-500 mb-6">Add your work history one role at a time. Required fields are marked with *</p>
            {addedExperiences.length > 0 && ( <div className="mb-6"><h3 className="text-lg font-semibold mb-2">Your Experience Entries:</h3><ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">{addedExperiences.map((exp, index) => ( <li key={index} className="text-gray-800">{exp.jobTitle} at {exp.company}</li>))}</ul></div>)}
            <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700">Job Title <span className="text-red-500">*</span></label><input type="text" id="jobTitle" value={currentExperience.jobTitle} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., Senior Frontend Developer" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Company <span className="text-red-500">*</span></label><input type="text" id="company" value={currentExperience.company} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., TechCorp" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label><input type="text" id="startDate" value={currentExperience.startDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., Jan 2020" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">End Date</label><input type="text" id="endDate" value={currentExperience.endDate} onChange={handleChange} disabled={currentExperience.isCurrent} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="e.g., Dec 2022" /></div>
                </div>
                <div className="flex items-center"><input type="checkbox" id="isCurrent" checked={currentExperience.isCurrent} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-900">I currently work here</label></div>
                <div><label className="block text-sm font-medium text-gray-700">Responsibilities / Key Accomplishments <span className="text-gray-400 text-sm ml-1">(Optional)</span></label><p className="text-xs text-gray-500 mb-1">List key points. Each on a new line. This helps the AI highlight your impact.</p><textarea id="achievements" value={currentExperience.achievements} onChange={handleChange} rows="5" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., Led the migration of a legacy system..."></textarea></div>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-between items-center mt-8">
                <button onClick={onPrevious} className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300">Previous</button>
                <div className="flex gap-4">
                    <button onClick={handleSaveAndAddAnother} disabled={!isFormValid} className="py-2 px-4 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Save & Add Another</button>
                    <button onClick={handleFinish} style={{ backgroundColor: primaryColor }} className="py-2 px-4 text-sm font-medium rounded-md text-white hover:opacity-90">Finish & Continue</button>
                </div>
            </div>
        </div>
    );
};

const EducationForm = ({ cvData, setCvData, onContinue, onPrevious, primaryColor }) => {
    const initialEducationState = { degree: '', institution: '', gradDate: '', gpa: '' };
    const [currentEducation, setCurrentEducation] = useState(initialEducationState);
    const [error, setError] = useState('');
    const handleChange = (e) => {
        const { id, value } = e.target;
        setCurrentEducation(prev => ({ ...prev, [id]: value }));
    };
    const isFormValid = currentEducation.degree && currentEducation.institution && currentEducation.gradDate;
    const saveEducation = () => {
        if (!isFormValid) { setError('Please fill in Degree, Institution, and Graduation Date.'); return false; }
        setCvData(prev => ({ ...prev, education: [...(prev.education || []), currentEducation] }));
        setError('');
        return true;
    };
    const handleSaveAndAddAnother = () => { if (saveEducation()) { setCurrentEducation(initialEducationState); } };
    const handleFinish = () => {
        const hasPartialData = currentEducation.degree || currentEducation.institution || currentEducation.gradDate;
        if (hasPartialData) { if (!saveEducation()) { return; } }
        onContinue();
    };
    const addedEducation = cvData?.education || [];
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-2">Education</h2>
            <p className="text-gray-500 mb-6">Add your education history one entry at a time. Required fields are marked with *</p>
            {addedEducation.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Your Education Entries:</h3>
                    <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">
                        {addedEducation.map((edu, index) => ( <li key={index} className="text-gray-800">{edu.degree} at {edu.institution}</li> ))}
                    </ul>
                </div>
            )}
            <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700">Degree / Certification <span className="text-red-500">*</span></label><input type="text" id="degree" value={currentEducation.degree} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., B.Sc. in Computer Science" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Institution <span className="text-red-500">*</span></label><input type="text" id="institution" value={currentEducation.institution} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., University of Technology" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Graduation Date <span className="text-red-500">*</span></label><input type="text" id="gradDate" value={currentEducation.gradDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500" placeholder="e.g., May 2019" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">GPA (Optional)</label><input type="text" id="gpa" value={currentEducation.gpa} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 3.8 / 4.0" /></div>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-between items-center mt-8">
                <button onClick={onPrevious} className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300">Previous</button>
                <div className="flex gap-4">
                    <button onClick={handleSaveAndAddAnother} disabled={!isFormValid} className="py-2 px-4 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Save & Add Another</button>
                    <button onClick={handleFinish} style={{ backgroundColor: primaryColor }} className="py-2 px-4 text-sm font-medium rounded-md text-white hover:opacity-90">Finish & Continue</button>
                </div>
            </div>
        </div>
    );
};

const AIQuestionnaire = ({ cvData, setCvData, generateCvFromUserInput, isAiLoading, primaryColor, handleChange, fillWithSampleData }) => {
    if (!cvData) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }
    const aiQuestions = [ { id: 'targetRole', question: "What is the exact job title you are applying for?", placeholder: "e.g., Senior Frontend Developer", required: true, dataKey: 'aiHelpers' }, { id: 'jobDescription', question: "To get the best results, paste the job description here.", placeholder: "Pasting the job description helps the AI tailor your CV...", isTextarea: true, optional: true, dataKey: 'aiHelpers' }, { id: 'name', question: "What is your full name?", placeholder: "e.g., John Doe", required: true, dataKey: 'personalInformation' }, { id: 'professionalTitle', question: "What professional title or target role do you want displayed directly under your name?", placeholder: "e.g., Senior Software Engineer", required: true, dataKey: 'personalInformation' }, { id: 'email', question: "What is your email address?", placeholder: "e.g., john.doe@email.com", required: true, dataKey: 'personalInformation' }, { id: 'phone', question: "What is your phone number?", placeholder: "e.g., (123) 456-7890", optional: true, dataKey: 'personalInformation' }, { id: 'linkedin', question: "What is your LinkedIn profile URL?", placeholder: "e.g., linkedin.com/in/johndoe", optional: true, dataKey: 'personalInformation' }, { id: 'city', question: "Which city do you live in?", placeholder: "e.g., San Francisco", optional: true, dataKey: 'personalInformation' }, { id: 'country', question: "And which country?", placeholder: "e.g., USA", optional: true, dataKey: 'personalInformation' }, { id: 'portfolioLink', question: "Do you have a portfolio or website link?", placeholder: "e.g., github.com/johndoe", optional: true, dataKey: 'personalInformation' }, { id: 'summary', question: "In one or two sentences, summarize your professional experience.", placeholder: "e.g., I'm a software engineer with over 8 years of experience building scalable web applications.", required: true, isTextarea: true }, { id: 'experience_step', type: 'experience_form' }, { id: 'education_step', type: 'education_form' }, { id: 'technical', question: "List your key technical skills.", placeholder: "Type a skill and press Enter...", required: true, dataKey: 'skills', inputType: 'tag' }, { id: 'soft', question: "And what are your most important soft skills?", placeholder: "Type a skill and press Enter...", required: true, dataKey: 'skills', inputType: 'tag' }, { id: 'languages', question: "Which languages do you speak, and at what level? (e.g., English (Native), Spanish (Conversational))", placeholder: "e.g., English (Native), Spanish (Conversational)", optional: true, dataKey: null }, { id: 'referencesRaw', question: "List any professional references. (Optional)", placeholder: "e.g., John Doe, (123) 456-7890, Senior Manager", isTextarea: true, optional: true, dataKey: 'aiHelpers' }, { id: 'awardsRaw', question: "Tell us about any awards or recognitions you've received. (Optional)", placeholder: "e.g., Employee of the Year 2023", isTextarea: true, optional: true, dataKey: 'aiHelpers' }, { id: 'coursesRaw', question: "List any relevant courses or online learning. (Optional)", placeholder: "e.g., Machine Learning, Coursera (2020)", isTextarea: true, optional: true, dataKey: 'aiHelpers' }, { id: 'certificationsRaw', question: "Include any professional certifications. (Optional)", placeholder: "e.g., AWS Certified Solutions Architect (2023)", isTextarea: true, optional: true, dataKey: 'aiHelpers' }, { id: 'customSectionsRaw', question: "Do you have other information like volunteer work or publications? (Optional)", placeholder: "Format: 'Header: Content'", isTextarea: true, optional: true, dataKey: 'aiHelpers' } ];
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const nextQuestion = () => { if (currentQuestionIndex < aiQuestions.length - 1) { setCurrentQuestionIndex(prev => prev + 1); } };
    const prevQuestion = () => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(prev => prev - 1); } };
    const currentQuestion = aiQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / aiQuestions.length) * 100;
    if (currentQuestion.type === 'experience_form') { return <ExperienceForm cvData={cvData} setCvData={setCvData} onContinue={nextQuestion} onPrevious={prevQuestion} primaryColor={primaryColor} />; }
    if (currentQuestion.type === 'education_form') { return <EducationForm cvData={cvData} setCvData={setCvData} onContinue={nextQuestion} onPrevious={prevQuestion} primaryColor={primaryColor} />; }
    let inputElement;
    if (currentQuestion.inputType === 'tag') {
        const tags = cvData[currentQuestion.dataKey]?.[currentQuestion.id] || [];
        const setTags = (newTags) => { setCvData(prev => ({ ...prev, [currentQuestion.dataKey]: { ...prev[currentQuestion.dataKey], [currentQuestion.id]: newTags }})); };
        inputElement = <TagInput tags={tags} setTags={setTags} placeholder={currentQuestion.placeholder} />;
    } else {
        let currentValue = '';
        if (cvData) { if (currentQuestion.dataKey) { currentValue = cvData[currentQuestion.dataKey]?.[currentQuestion.id] || ''; } else { currentValue = cvData[currentQuestion.id] || ''; } }
        const handleInputChange = (e) => { handleChange(e, currentQuestion.dataKey); };
        inputElement = (<textarea id={currentQuestion.id} rows={currentQuestion.isTextarea ? 8 : 4} value={currentValue} onChange={handleInputChange} placeholder={currentQuestion.placeholder} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />);
    }
    return (<div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-center mb-2">AI-Powered CV Builder</h2><button onClick={fillWithSampleData} className="text-xs bg-purple-100 text-purple-700 py-1 px-2 rounded-md hover:bg-purple-200">Fill Sample</button></div><p className="text-center text-gray-500 mb-6">Answer these simple questions, and our AI will write your CV.</p><div className="w-full bg-gray-200 rounded-full h-2 mb-6"><div className="h-2 rounded-full" style={{ width: `${progress}%`, backgroundColor: primaryColor, transition: 'width 0.3s ease-in-out' }}></div></div><div className="mb-6"><label htmlFor={currentQuestion.id} className="block text-lg font-medium text-gray-800 mb-3">{currentQuestion.question}{currentQuestion.required && <span className="text-red-500 ml-1">*</span>}{currentQuestion.optional && <span className="text-gray-400 text-sm ml-2">(Optional)</span>}</label>{inputElement}</div><div className="flex justify-between items-center"><button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Previous</button>{currentQuestionIndex < aiQuestions.length - 1 ? ( <button onClick={nextQuestion} className="py-2 px-4 text-sm font-medium rounded-md text-white" style={{ backgroundColor: primaryColor }} >Next</button>) : ( <button onClick={generateCvFromUserInput} disabled={isAiLoading} className="py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50" >{isAiLoading ? 'Generating...' : 'Generate CV with AI'}</button>)}</div></div>);
};

const cvTemplates = [
    { id: 'modern', name: 'Modern Minimalist', imageUrl: '/images/templates/modern.jpg', defaultSettings: { primaryColor: '#007BFF', dividerColor: '#e0e0e0', paragraphFontSize: '11pt', headerFontSize: '14pt', lineHeight: '1.4', fontFamily: 'Inter, sans-serif' } },
    { id: 'classic', name: 'Classic Professional', imageUrl: '/images/templates/classic.jpg', defaultSettings: { primaryColor: '#333333', dividerColor: '#cccccc', paragraphFontSize: '10.5pt', headerFontSize: '13.5pt', lineHeight: '1.5', fontFamily: 'Merriweather, serif' } },
    { id: 'elegant', name: 'Elegant Serenity', imageUrl: '/images/templates/elegant.jpg', defaultSettings: { primaryColor: '#8E44AD', dividerColor: '#d8bfd8', paragraphFontSize: '11pt', headerFontSize: '15pt', lineHeight: '1.4', fontFamily: 'Open Sans, sans-serif' } },
    { id: 'bold', name: 'Bold & Impactful', imageUrl: '/images/templates/professional.jpg', defaultSettings: { primaryColor: '#D9534F', dividerColor: '#f2dede', paragraphFontSize: '12pt', headerFontSize: '16pt', lineHeight: '1.3', fontFamily: 'Montserrat, sans-serif' } },
    { id: 'creative', name: 'Creative Flair', imageUrl: '/images/templates/creative.jpg', defaultSettings: { primaryColor: '#28A745', dividerColor: '#d4edda', paragraphFontSize: '10pt', headerFontSize: '13pt', lineHeight: '1.6', fontFamily: 'Lato, sans-serif' } },
    { id: 'minimalist', name: 'Clean & Simple', imageUrl: '/images/templates/minimalist.jpg', defaultSettings: { primaryColor: '#6C757D', dividerColor: '#e9ecef', paragraphFontSize: '11.5pt', headerFontSize: '14.5pt', lineHeight: '1.45', fontFamily: 'Roboto, sans-serif' } }
];

const CvBuilder = () => {
    const [cvData, setCvData] = useState(null);
    const [cvId, setCvId] = useState(null);
    const [cvName, setCvName] = useState("Untitled CV");
    const [mode, setMode] = useState(null);
    const [aiFlowStep, setAiFlowStep] = useState(null);
    const [isAiGenerated, setIsAiGenerated] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
    const [pageState, setPageState] = useState('LOADING');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading, isAuthenticated } = useAuth();
    const componentToPrintRef = useRef(null);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [writeCount, setWriteCount] = useState(0);
    const [saveState, setSaveState] = useState('idle');

    const primaryColor = cvData?.settings?.primaryColor || '#2563EB';

    const getInitialCvData = useCallback((templateId = null) => {
        const sectionOrder = [ 'summary', 'experience', 'education', 'projects', 'skills', 'languages', 'references', 'awards', 'courses', 'certifications', 'customSections' ];
        let initialSettings = {
            primaryColor: '#2563EB', dividerColor: '#e0e0e0', paragraphFontSize: '11pt', headerFontSize: '14pt', lineHeight: '1.4', fontFamily: 'Inter, sans-serif', templateId: templateId || 'modern',
            sectionOrder: sectionOrder,
            showExperienceHeaders: true,
            sectionVisibility: sectionOrder.reduce((acc, sectionId) => { acc[sectionId] = true; return acc; }, {})
        };
        if (templateId) { const selectedTemplate = cvTemplates.find(t => t.id === templateId); if (selectedTemplate) { initialSettings = { ...initialSettings, ...selectedTemplate.defaultSettings, templateId: templateId }; } }
        return { personalInformation: { name: '', professionalTitle: '', email: '', phone: '', linkedin: '', city: '', country: '', portfolioLink: '' }, summary: '<p></p>', experience: [], education: [], projects: [], skills: { technical: [], soft: [] }, languages: '', references: [], awards: [], courses: [], certifications: [], customSections: [], settings: initialSettings, aiHelpers: { targetRole: '', jobDescription: '', referencesRaw: '', awardsRaw: '', coursesRaw: '', certificationsRaw: '', customSectionsRaw: '' }, };
    }, []);

    const handlePrint = useReactToPrint({ content: () => componentToPrintRef.current, documentTitle: `${cvName.replace(/\s/g, '_') || 'My_CV'}`, onPrintError: (error) => console.error("Error printing:", error), pageStyle: `@page { size: A4; margin: 1cm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }` });
    
    const fillWithSampleData = () => { setCvData(prev => ({ ...prev, personalInformation: { name: 'Qusai Ahmad', professionalTitle: 'Senior QA Automation Engineer', email: 'qusai.ahmad@email.com', phone: '(123) 456-7890', linkedin: 'linkedin.com/in/q-ahmad', city: 'Amman', country: 'Jordan', portfolioLink: 'github.com/q-ahmad' }, summary: '<p>Highly accomplished Senior QA Automation Engineer with over 7 years of experience specializing in building robust testing frameworks for web and mobile applications. Proven ability to lead teams, optimize CI/CD pipelines, and significantly improve quality and efficiency. Expertise in Cypress, Selenium, Java, and API testing.</p>', experience: [ { jobTitle: 'Test Lead', company: 'Innovate Solutions', startDate: 'Jan 2022', endDate: 'Present', isCurrent: true, responsibilities: '<ul><li>Led a team of 5 QA engineers in the design, development, and execution of automated tests.</li><li>Collaborated with development teams to integrate testing earlier in the SDLC.</li><li>Managed and optimized CI/CD pipelines using Jenkins and Selenium.</li></ul>', achievements: '<ul><li>Designed and implemented a new CI/CD testing pipeline using Jenkins and Selenium, decreasing bug detection time by 40%.</li><li>Improved test coverage by 30% for the flagship product.</li></ul>', showResponsibilities: true, showAchievements: true }, { jobTitle: 'QA Engineer', company: 'Tech Solutions Inc.', startDate: 'Jun 2019', endDate: 'Dec 2021', isCurrent: false, responsibilities: '<p>Developed and maintained automated test scripts for critical web applications using Java and Selenium WebDriver.</p>', achievements: '', showResponsibilities: true, showAchievements: false } ], education: [{ degree: 'B.Sc. in Software Engineering', institution: 'Hashemite University', gradDate: '2019', gpa: '3.5' }], projects: [], skills: { technical: ['Java', 'Selenium', 'Cypress', 'Appium', 'SQL', 'Postman', 'Jira', 'Jenkins'], soft: ['Critical Thinking', 'Communication', 'Mentorship', 'Problem-solving'] }, languages: 'English (Fluent), Arabic (Native)', aiHelpers: { targetRole: 'Senior QA Automation Engineer', jobDescription: 'We are seeking a Senior QA Automation Engineer with extensive experience in creating testing frameworks from scratch. Must be proficient in Cypress and/or Selenium, have strong Java skills, and be able to work with CI/CD pipelines like Jenkins. Experience with API testing using Postman is a plus. Candidates should demonstrate strong leadership and problem-solving skills.' } })); };

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user && !user.emailVerified) { router.push('/auth/verify-email'); return; }
        if (isSetupComplete) return;
        const cvIdFromUrl = searchParams.get('cvId');
        if (!cvIdFromUrl) { router.push('/dashboard'); return; }
        const setupCv = async () => {
            setPageState('LOADING');
            if (cvIdFromUrl === 'new') {
                const newId = `cv_${Date.now()}`;
                setCvId(newId);
                setCvName("Untitled CV");
                setCvData(getInitialCvData());
                setMode(null); setIsAiGenerated(false); setAiFlowStep(null);
                setPageState('READY'); setIsSetupComplete(true);
            } else {
                try {
                    const userDocRef = doc(db, 'users', String(user.id));
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const allCvs = userDocSnap.data().cvs || [];
                        const specificCv = allCvs.find(cv => cv.id === cvIdFromUrl);
                        if (specificCv) {
                            setCvId(specificCv.id); setCvName(specificCv.name);
                            const templateIdFromSaved = specificCv.cvData?.settings?.templateId;
                            const initialCvData = getInitialCvData(templateIdFromSaved);
                            const loadedCvData = { ...initialCvData, ...specificCv.cvData, settings: { ...initialCvData.settings, ...(specificCv.cvData?.settings || {}), sectionVisibility: { ...initialCvData.settings.sectionVisibility, ...(specificCv.cvData?.settings?.sectionVisibility || {}) } } };
                            if (typeof loadedCvData.skills.technical === 'string') { loadedCvData.skills.technical = loadedCvData.skills.technical.split(',').map(s => s.trim()).filter(Boolean); }
                            if (typeof loadedCvData.skills.soft === 'string') { loadedCvData.skills.soft = loadedCvData.skills.soft.split(',').map(s => s.trim()).filter(Boolean); }
                            const ensureHtml = (text) => { if (!text) return '<p></p>'; const trimmed = text.trim(); if ((trimmed.startsWith('<') && trimmed.endsWith('>')) || trimmed === '<p></p>') return text; return `<p>${text.split('\n').filter(Boolean).join('</p><p>')}</p>`; };
                            loadedCvData.summary = ensureHtml(loadedCvData.summary);
                            loadedCvData.experience = (loadedCvData.experience || []).map(exp => ({ ...exp, responsibilities: ensureHtml(exp.responsibilities), achievements: ensureHtml(exp.achievements) }));
                            loadedCvData.projects = (loadedCvData.projects || []).map(proj => ({ ...proj, description: ensureHtml(proj.description) }));
                            loadedCvData.customSections = (loadedCvData.customSections || []).map(section => ({ ...section, content: ensureHtml(section.content) }));
                            setCvData(loadedCvData);
                            const creationMethod = specificCv.creationMethod || 'manual';
                            setMode(creationMethod); setIsAiGenerated(creationMethod === 'ai');
                            if (creationMethod === 'ai' && specificCv.cvData) { setAiFlowStep('editor'); } else if (creationMethod === 'ai') { setAiFlowStep('templateSelection'); } else { setAiFlowStep(null); }
                            setPageState('READY'); setIsSetupComplete(true);
                        } else { setErrorMessage("CV not found."); setPageState('ERROR'); }
                    } else { setErrorMessage("User profile not found."); setPageState('ERROR'); }
                } catch (error) { console.error("Failed to load CV:", error); setErrorMessage("Failed to load CV."); setPageState('ERROR'); }
            }
        };
        setupCv();
    }, [user, loading, isAuthenticated, searchParams, router, isSetupComplete, getInitialCvData]);

    const handleSaveProgress = useCallback(async () => {
        if (!user || !cvId || !cvData) { return; }
        setSaveState('saving');
        setWriteCount(prevCount => prevCount + 1);
        try {
            const { aiHelpers, ...cvDataToSave } = cvData;
            const userDocRef = doc(db, 'users', String(user.id));
            const userDocSnap = await getDoc(userDocRef);
            const existingCvs = userDocSnap.exists() ? userDocSnap.data().cvs || [] : [];
            const cvIndex = existingCvs.findIndex(cv => cv.id === cvId);
            const creationMethod = cvIndex > -1 ? existingCvs[cvIndex].creationMethod : mode;
            const newCvPayload = { id: cvId, name: cvName, updatedAt: new Date().toISOString(), cvData: cvDataToSave, creationMethod };
            if (cvIndex > -1) { existingCvs[cvIndex] = newCvPayload; } else { existingCvs.push(newCvPayload); }
            await setDoc(userDocRef, { cvs: existingCvs }, { merge: true });
            setSaveState('saved');
            setTimeout(() => setSaveState('idle'), 2000);
        } catch (error) {
            setSaveState('idle');
            if (error.code !== 'resource-exhausted') {
                console.error("Manual save failed:", error);
                alert("Failed to save progress. Please check the console for details.");
            } else {
                alert("Save failed: You have exceeded your daily limit for database writes.");
            }
        }
    }, [user, cvId, cvData, cvName, mode]);
    
    const generateCvFromUserInput = async () => {
        setIsAiLoading(true);
        setErrorMessage('');
        const { targetRole, jobDescription, ...restAiHelpers } = cvData.aiHelpers;
        const experienceRaw = (cvData.experience || []).map(exp => { const textContent = (typeof window !== "undefined" && new DOMParser().parseFromString(exp.responsibilities, 'text/html').body.textContent) || ''; return `Role: ${exp.jobTitle} at ${exp.company}. Dates: ${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}. Responsibilities/Achievements: ${textContent}`; }).join('\n\n');
        const educationRaw = (cvData.education || []).map(edu => `${edu.degree} from ${edu.institution}, ${edu.gradDate}.`).join('\n');
        const skillsForAI = {
            technical: Array.isArray(cvData.skills.technical) ? cvData.skills.technical.join(', ') : cvData.skills.technical,
            soft: Array.isArray(cvData.skills.soft) ? cvData.skills.soft.join(', ') : cvData.skills.soft,
        }
        const userInput = { personalInformation: { ...cvData.personalInformation }, summary: cvData.summary, experienceRaw, educationRaw, skills: skillsForAI, languages: cvData.languages, ...restAiHelpers };
        try {
            const parsedJson = await aiService.generateFullCv(userInput, targetRole, jobDescription);
            const ensureHtml = (text) => { if (!text) return '<p></p>'; if (text.trim().startsWith('<')) return text; const lines = text.split('\n').filter(line => line.trim()); if (lines.length > 1 || lines[0]?.startsWith('- ') || lines[0]?.startsWith('* ')) { return `<ul>${lines.map(line => `<li>${line.replace(/^[-*]\s*/, '')}</li>`).join('')}</ul>`; } return `<p>${text}</p>`; };
            const aiSkills = parsedJson.skills || {};
            const finalSkills = {
                technical: typeof aiSkills.technical === 'string' ? aiSkills.technical.split(',').map(s => s.trim()).filter(Boolean) : (cvData.skills.technical || []),
                soft: typeof aiSkills.soft === 'string' ? aiSkills.soft.split(',').map(s => s.trim()).filter(Boolean) : (cvData.skills.soft || []),
            };
            const updatedCvData = { ...cvData, ...parsedJson, skills: finalSkills, education: parsedJson.education || cvData.education, personalInformation: { ...cvData.personalInformation, ...parsedJson.personalInformation }, summary: ensureHtml(parsedJson.summary || cvData.summary), experience: (parsedJson.experience || []).map(exp => ({ ...exp, responsibilities: ensureHtml(exp.responsibilities), achievements: ensureHtml(exp.achievements), showResponsibilities: true, showAchievements: !!exp.achievements })), projects: (parsedJson.projects || []).map(proj => ({ ...proj, description: ensureHtml(proj.description) })), customSections: (parsedJson.customSections || []).map(section => ({ ...section, content: ensureHtml(section.content) })), languages: parsedJson.languages || cvData.languages, };
            setCvData(updatedCvData); setMode('ai'); setIsAiGenerated(true); setAiFlowStep('editor'); 
        } catch (error) { setErrorMessage(`Error generating CV: ${error.message}`); }
        finally { setIsAiLoading(false); }
    };

    const handleChange = useCallback((e, dataKey, index) => { const { id, value } = e.target; setCvData(prev => { if (!prev) return prev; const newCvData = JSON.parse(JSON.stringify(prev)); if (dataKey) { if (typeof index === 'number') { if (!newCvData[dataKey]) newCvData[dataKey] = []; if (!newCvData[dataKey][index]) newCvData[dataKey][index] = {}; newCvData[dataKey][index][id] = value; } else { if (!newCvData[dataKey]) newCvData[dataKey] = {}; newCvData[dataKey][id] = value; } } else { newCvData[id] = value; } return newCvData; }); }, []); 
    const handleSettingsChange = useCallback((id, value) => { setCvData(prev => ({ ...prev, settings: { ...prev.settings, [id]: value } })); }, []);
    const handleTemplateSelection = useCallback((templateId) => { const selectedTemplate = cvTemplates.find(t => t.id === templateId); if (selectedTemplate) { setCvData(prev => ({ ...prev, settings: { ...prev.settings, ...selectedTemplate.defaultSettings, templateId: templateId } })); } }, []);
    const handleStartOver = () => { setPageState('LOADING'); setCvData(getInitialCvData()); setIsAiGenerated(false); setShowStartOverConfirm(false); setMode(null); setAiFlowStep(null); setPageState('READY'); };

    const renderContent = () => {
        switch (pageState) {
            case 'LOADING': return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
            case 'ERROR': return <div className="text-center text-red-500">{errorMessage}</div>;
            case 'READY':
                if (!cvData) { return <div className="flex justify-center items-center h-screen"><Spinner /></div>; }
                if (!mode) {
                    const isPro = user && user.subscriptionStatus === 'active';
                    return (
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-4xl font-bold mb-4">Choose Your Path</h1>
                            <p className="text-gray-600 mb-8">How would you like to create this CV?</p>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div onClick={() => setMode('manual')} className="flex-1 p-8 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all">
                                    <h2 className="text-2xl font-bold mb-2">Manual Builder</h2>
                                    <p className="text-gray-500">A simple, single-page form to build your CV.</p>
                                </div>
                                <div onClick={() => { if (isPro) { setMode('ai'); setAiFlowStep('templateSelection'); } else { router.push('/pricing'); } }} className="relative group flex-1 p-8 border-2 border-blue-500 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                                    {!isPro && ( <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">PRO</div> )}
                                    <h2 className="text-2xl font-bold mb-2 text-blue-600">Premium AI Builder</h2>
                                    <p className="text-gray-500">Generate your CV with AI and edit it with a live preview.</p>
                                    {!isPro && ( <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Requires a Pro subscription</div> )}
                                </div>
                            </div>
                        </div>
                    );
                }
                if (mode === 'ai') {
                    if (aiFlowStep === 'templateSelection') { return ( <TemplateSelector templates={cvTemplates} selectedTemplateId={cvData.settings.templateId} onSelectTemplate={handleTemplateSelection} onNext={() => setAiFlowStep('questionnaire')} primaryColor={primaryColor} setPrimaryColor={(value) => handleSettingsChange('primaryColor', value)} setDividerColor={(value) => handleSettingsChange('dividerColor', value)} setFontSize={(value) => handleSettingsChange('paragraphFontSize', value)} setLineHeight={(value) => handleSettingsChange('lineHeight', value)} setFontFamily={(value) => handleSettingsChange('fontFamily', value)} /> ); }
                    else if (aiFlowStep === 'questionnaire') { return ( <AIQuestionnaire cvData={cvData} setCvData={setCvData} generateCvFromUserInput={generateCvFromUserInput} isAiLoading={isAiLoading} primaryColor={primaryColor} handleChange={handleChange} fillWithSampleData={fillWithSampleData} /> ); }
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
                <div className="mx-auto mb-6 flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center gap-4 flex-grow">
                        <input type="text" value={cvName} onChange={(e) => setCvName(e.target.value)} className="text-2xl font-bold text-gray-800 border-b-2 border-transparent focus:border-blue-500 outline-none flex-grow" placeholder="Enter CV Name" />
                        {process.env.NODE_ENV === 'development' && (
                            <span className="ml-4 text-xs bg-yellow-200 text-yellow-800 font-mono p-1 rounded">
                                Writes: {writeCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSaveProgress}
                            disabled={saveState === 'saving'}
                            className={`font-semibold py-2 px-4 rounded-lg shadow-md transition whitespace-nowrap ${
                                saveState === 'saving' ? 'bg-gray-400 text-white cursor-not-allowed' :
                                saveState === 'saved' ? 'bg-green-600 text-white' :
                                'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved!' : 'Save Progress'}
                        </button>
                        <button onClick={handlePrint} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition whitespace-nowrap">Download PDF</button>
                        <Link href="/dashboard" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition whitespace-nowrap">Back to Dashboard</Link>
                    </div>
                </div>
            )}
            <main className="mx-auto">{renderContent()}</main>
            <div style={{ position: 'fixed', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
                {cvData && ( <PrintableCv ref={componentToPrintRef} data={cvData} primaryColor={primaryColor} settings={cvData.settings} /> )}
            </div>
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
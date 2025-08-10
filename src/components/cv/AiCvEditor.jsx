// src/components/cv/AiCvEditor.jsx

import React, { useState, useMemo, useRef, memo } from 'react';
import { aiService } from '../../services/aiService';
import PrintableCv from './PrintableCv'; 
import RichTextEditor from '../common/RichTextEditor';

// --- Reusable Components ---

const MagicWandButton = ({ onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="absolute top-1 right-1 p-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50 disabled:animate-pulse"
    title="Refine with AI"
  >
    {isLoading ? (
      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    )}
  </button>
);

const EditableField = ({ label, value, onChange, name, type = 'text', rows = 3, onRefine, isRefining, isRichText = false }) => (
  <div className="mb-4 relative">
    {label && <label className="block text-sm font-bold text-gray-600 mb-1">{label}</label>}
    {isRichText ? (
      <RichTextEditor
        initialHtml={value}
        onChange={(html) => onChange({ target: { name, value: html } })}
        placeholder={`Enter ${label.toLowerCase()}...`}
        isEditable={true}
      />
    ) : type === 'textarea' ? (
      <textarea name={name} value={value || ''} onChange={onChange} rows={rows} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 resize-y" />
    ) : (
      <input type={type} name={name} value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500" />
    )}
    {onRefine && <MagicWandButton onClick={onRefine} isLoading={isRefining} />}
  </div>
);

const EditorSection = ({ title, children, primaryColor }) => (
  <div className="p-4 border rounded-lg mb-6 bg-gray-50/50 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 border-b pb-2" style={{ borderColor: primaryColor, color: primaryColor }}>{title}</h3>
    {children}
  </div>
);

const KeywordChip = ({ keyword, isMatched }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${isMatched ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
    {keyword}
  </span>
);

// --- NEW: A dedicated button for toggling visibility ---
const ToggleVisibilityButton = ({ isVisible, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={isVisible ? "Hide Section" : "Show Section"}
    className="p-1 text-gray-400 hover:text-gray-600"
  >
    {isVisible ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    )}
  </button>
);


// --- Main Editor Component ---
const AiCvEditor = ({ cvData, setCvData }) => {
  const previewRef = useRef(null);
  const [loadingStates, setLoadingStates] = useState({});
  const draggedItemRef = useRef(null); 
  const primaryColor = cvData.settings?.primaryColor || '#2563EB';

  const jobKeywords = useMemo(() => {
    if (!cvData.aiHelpers?.jobDescription) return [];
    const commonWords = new Set(['and','the','is','a','in','for','of','to','with','on','as','at','it','an','our','we','are']);
    const keywords = cvData.aiHelpers.jobDescription.toLowerCase().match(/\b([a-zA-Z]{3,})\b/g) || [];
    return [...new Set(keywords)].filter(word => !commonWords.has(word) && isNaN(word)).slice(0, 15);
  }, [cvData.aiHelpers?.jobDescription]);

  const cvTextContent = useMemo(() => {
    const htmlToPlainText = (html) => html ? html.replace(/<[^>]*>?/gm, ' ') : '';
    let combinedText = Object.values(cvData.personalInformation).join(' ') + ' ';
    combinedText += htmlToPlainText(cvData.summary) + ' ';
    cvData.experience.forEach(exp => {
        combinedText += htmlToPlainText(exp.responsibilities) + ' ';
        combinedText += htmlToPlainText(exp.achievements) + ' ';
    });
    cvData.projects.forEach(proj => { combinedText += htmlToPlainText(proj.description) + ' '; });
    cvData.customSections.forEach(section => { combinedText += htmlToPlainText(section.content) + ' '; });
    combinedText += Object.values(cvData.skills).join(' ') + ' ';
    combinedText += cvData.languages + ' ';
    return combinedText.toLowerCase();
  }, [cvData]);

  const handleSettingsChange = (settingKey, value) => {
    setCvData(prev => ({ ...prev, settings: { ...(prev.settings || {}), [settingKey]: value } }));
  };

  const handleRefine = async (fieldName, currentValue, updateFn) => {
    if (!currentValue) return;
    setLoadingStates(prev => ({ ...prev, [fieldName]: true }));
    try {
      const refinedText = await aiService.refineText(currentValue, cvData.aiHelpers?.jobDescription);
      updateFn(refinedText);
    } catch (error) {
      alert(`Error refining text: ${error.message}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [fieldName]: false }));
    }
  };
  
  const handleGenerateIdeas = async (index, jobTitle) => {
     if (!jobTitle) return;
     const fieldName = `experienceIdeas-${index}`;
     setLoadingStates(prev => ({ ...prev, [fieldName]: true }));
     try {
       const ideas = await aiService.generateIdeas(jobTitle);
       const existingResponsibilities = cvData.experience[index].responsibilities || '';
       const newResponsibilities = existingResponsibilities ? `${existingResponsibilities}\n${ideas}` : ideas;
       handleDynamicChange({ target: { name: 'responsibilities', value: newResponsibilities } }, index, 'experience');
     } catch (error) {
       alert(`Error generating ideas: ${error.message}`);
     } finally {
       setLoadingStates(prev => ({ ...prev, [fieldName]: false }));
     }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({...prev, personalInformation: { ...prev.personalInformation, [name]: value }}));
  };
  
  const handleSummaryChange = (e) => setCvData(prev => ({ ...prev, summary: e.target.value }));
  
  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({ ...prev, skills: { ...prev.skills, [name]: value }}));
  };

  const handleLanguagesChange = (e) => setCvData(prev => ({ ...prev, languages: e.target.value }));

  const handleDynamicChange = (e, index, section) => {
    const { name, value } = e.target;
    setCvData(prev => {
        const newSectionData = [...(prev[section] || [])];
        newSectionData[index] = { ...newSectionData[index], [name]: value };
        return { ...prev, [section]: newSectionData };
    });
  };

  // --- NEW: Function to toggle visibility flags in the experience data ---
  const toggleSectionVisibility = (index, sectionKey, flagKey) => {
    setCvData(prev => {
        const newSectionData = JSON.parse(JSON.stringify(prev[sectionKey] || []));
        // Toggle the boolean flag, defaulting to true if it's undefined
        newSectionData[index][flagKey] = !(newSectionData[index][flagKey] !== false);
        return { ...prev, [sectionKey]: newSectionData };
    });
  };

  // --- MODIFIED: Ensure new entries have visibility flags ---
  const addDynamicEntry = (section, defaultData = {}) => {
    let entryData = defaultData;
    if (section === 'experience') {
        entryData = {
            jobTitle: '', company: '', duration: '',
            responsibilities: '<p></p>', achievements: '<p></p>',
            showResponsibilities: true, // Default to visible
            showAchievements: true,   // Default to visible
            ...defaultData,
        };
    } else if (section === 'projects') {
        entryData = { name: '', technologies: '', description: '<p></p>', ...defaultData };
    } else if (section === 'customSections') {
        entryData = { header: 'New Custom Section', content: '<p></p>', ...defaultData };
    }

    setCvData(prev => ({ ...prev, [section]: [...(prev[section] || []), entryData] }));
  };
  
  const removeDynamicEntry = (index, section) => {
    setCvData(prev => ({ ...prev, [section]: (prev[section] || []).filter((_, i) => i !== index) }));
  };

  const handleJobDescriptionChange = (e) => setCvData(prev => ({...prev, aiHelpers: {...prev.aiHelpers, jobDescription: e.target.value }}));

  // Drag and Drop Logic
  const handleDragStart = (e, sectionId) => {
    e.dataTransfer.setData('text/plain', sectionId);
    draggedItemRef.current = sectionId;
    e.currentTarget.classList.add('opacity-50', 'border-dashed', 'border-blue-500'); 
  };
  const handleDragOver = (e) => {
    e.preventDefault(); 
    const target = e.currentTarget;
    if (target.dataset.sectionId !== draggedItemRef.current) {
      target.classList.add('border-blue-300', 'bg-blue-50'); 
    }
  };
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
  };
  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
    const draggedSectionId = draggedItemRef.current;
    if (draggedSectionId && draggedSectionId !== targetSectionId) {
      setCvData(prevCvData => {
        const newSettings = { ...prevCvData.settings };
        const currentOrder = [...(newSettings.sectionOrder || [])];
        const draggedIndex = currentOrder.indexOf(draggedSectionId);
        const targetIndex = currentOrder.indexOf(targetSectionId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = currentOrder.splice(draggedIndex, 1);
          currentOrder.splice(targetIndex, 0, removed);
        }
        newSettings.sectionOrder = currentOrder;
        return { ...prevCvData, settings: newSettings };
      });
    }
    draggedItemRef.current = null; 
  };
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50', 'border-dashed', 'border-blue-500');
  };

  const sectionComponents = useMemo(() => ({
    summary: (
      <EditorSection title="Professional Summary" primaryColor={primaryColor}>
        <EditableField label="Summary" name="summary" isRichText value={cvData.summary} onChange={handleSummaryChange} onRefine={() => handleRefine('summary', cvData.summary, (v) => setCvData(p => ({...p, summary: v})))} isRefining={loadingStates['summary']} />
      </EditorSection>
    ),
    experience: (
      <EditorSection title="Work Experience" primaryColor={primaryColor}>
        {(cvData.experience || []).map((exp, index) => (
          <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3">
             <button onClick={() => removeDynamicEntry(index, 'experience')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
             <EditableField label="Job Title" name="jobTitle" value={exp.jobTitle} onChange={e => handleDynamicChange(e, index, 'experience')} />
             <EditableField label="Company" name="company" value={exp.company} onChange={e => handleDynamicChange(e, index, 'experience')} />
             <EditableField label="Duration" name="duration" value={exp.duration} onChange={e => handleDynamicChange(e, index, 'experience')} />
             
             {/* --- MODIFIED: Responsibilities with visibility toggle --- */}
             <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-600 mb-1">Responsibilities</label>
                <ToggleVisibilityButton 
                    isVisible={exp.showResponsibilities !== false} // Default to true if undefined
                    onClick={() => toggleSectionVisibility(index, 'experience', 'showResponsibilities')} 
                />
             </div>
             {(exp.showResponsibilities !== false) && (
                <EditableField label="" name="responsibilities" isRichText value={exp.responsibilities} onChange={e => handleDynamicChange(e, index, 'experience')} onRefine={() => handleRefine(`expResp-${index}`, exp.responsibilities, v => handleDynamicChange({target: {name:'responsibilities', value:v}}, index, 'experience'))} isRefining={loadingStates[`expResp-${index}`]} />
             )}

             {/* --- MODIFIED: Achievements with visibility toggle --- */}
             <div className="flex justify-between items-center mt-2">
                <label className="block text-sm font-bold text-gray-600 mb-1">Achievements</label>
                <ToggleVisibilityButton 
                    isVisible={exp.showAchievements !== false} // Default to true if undefined
                    onClick={() => toggleSectionVisibility(index, 'experience', 'showAchievements')}
                />
             </div>
             {(exp.showAchievements !== false) && (
                <EditableField label="" name="achievements" isRichText value={exp.achievements} onChange={e => handleDynamicChange(e, index, 'experience')} onRefine={() => handleRefine(`expAchv-${index}`, exp.achievements, v => handleDynamicChange({target: {name:'achievements', value:v}}, index, 'experience'))} isRefining={loadingStates[`expAchv-${index}`]} />
             )}

             {!exp.responsibilities && exp.jobTitle && (
                <button onClick={() => handleGenerateIdeas(index, exp.jobTitle)} disabled={loadingStates[`experienceIdeas-${index}`]} className="w-full text-xs py-1 px-2 mt-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md">
                    {loadingStates[`experienceIdeas-${index}`] ? 'Generating Ideas...' : '🤖 Generate Responsibility Ideas'}
                </button>
             )}
          </div>
        ))}
        <button onClick={() => addDynamicEntry('experience')} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Work Experience</button>
      </EditorSection>
    ),
    education: (
      <EditorSection title="Education" primaryColor={primaryColor}>
        {(cvData.education || []).map((edu, index) => (
          <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3">
             <button onClick={() => removeDynamicEntry(index, 'education')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
             <EditableField label="Degree / Certification" name="degree" value={edu.degree} onChange={(e) => handleDynamicChange(e, index, 'education')} />
             <EditableField label="Institution" name="institution" value={edu.institution} onChange={(e) => handleDynamicChange(e, index, 'education')} />
             <EditableField label="Graduation Date" name="gradDate" value={edu.gradDate} onChange={(e) => handleDynamicChange(e, index, 'education')} />
             <EditableField label="GPA (Optional)" name="gpa" value={edu.gpa} onChange={(e) => handleDynamicChange(e, index, 'education')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('education', { degree: '', institution: '', gradDate: '', gpa: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Education</button>
      </EditorSection>
    ),
    projects: (
        <EditorSection title="Projects" primaryColor={primaryColor}>
            {(cvData.projects || []).map((project, index) => (
                <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3">
                    <button onClick={() => removeDynamicEntry(index, 'projects')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    <EditableField label="Project Name" name="name" value={project.name} onChange={e => handleDynamicChange(e, index, 'projects')} />
                    <EditableField label="Technologies Used" name="technologies" value={project.technologies} onChange={e => handleDynamicChange(e, index, 'projects')} />
                    <EditableField label="Description" name="description" isRichText value={project.description} onChange={e => handleDynamicChange(e, index, 'projects')} onRefine={() => handleRefine(`projDesc-${index}`, project.description, v => handleDynamicChange({target: {name:'description', value:v}}, index, 'projects'))} isRefining={loadingStates[`projDesc-${index}`]}/>
                </div>
            ))}
            <button onClick={() => addDynamicEntry('projects')} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Project</button>
        </EditorSection>
    ),
    // ... Other sections (skills, languages, etc.) are unchanged ...
    skills: ( <EditorSection title="Skills" primaryColor={primaryColor}> <EditableField label="Technical Skills" name="technical" type="textarea" value={cvData.skills?.technical} onChange={handleSkillsChange} onRefine={() => handleRefine('techSkills', cvData.skills?.technical, v => handleSkillsChange({target: {name:'technical', value:v}}))} isRefining={loadingStates['techSkills']} /> <EditableField label="Soft Skills" name="soft" type="textarea" value={cvData.skills?.soft} onChange={handleSkillsChange} onRefine={() => handleRefine('softSkills', cvData.skills?.soft, v => handleSkillsChange({target: {name:'soft', value:v}}))} isRefining={loadingStates['softSkills']} /> </EditorSection> ),
    languages: ( <EditorSection title="Languages" primaryColor={primaryColor}> <EditableField label="Languages" name="languages" type="textarea" value={cvData.languages} onChange={handleLanguagesChange} /> </EditorSection> ),
    references: ( <EditorSection title="References" primaryColor={primaryColor}> {(cvData.references || []).map((ref, index) => ( <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'references')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Name" name="name" value={ref.name} onChange={e => handleDynamicChange(e, index, 'references')} /> <EditableField label="Position" name="position" value={ref.position} onChange={e => handleDynamicChange(e, index, 'references')} /> <EditableField label="Phone Number" name="phone" value={ref.phone} onChange={e => handleDynamicChange(e, index, 'references')} /> </div> ))} <button onClick={() => addDynamicEntry('references', { name: '', phone: '', position: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Reference</button> </EditorSection> ),
    awards: ( <EditorSection title="Awards & Recognitions" primaryColor={primaryColor}> {(cvData.awards || []).map((award, index) => ( <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'awards')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Title" name="title" value={award.title} onChange={e => handleDynamicChange(e, index, 'awards')} /> <EditableField label="Issuer (Optional)" name="issuer" value={award.issuer} onChange={e => handleDynamicChange(e, index, 'awards')} /> <EditableField label="Year (Optional)" name="year" value={award.year} onChange={e => handleDynamicChange(e, index, 'awards')} /> <EditableField label="Description (Optional)" name="description" type="textarea" rows="2" value={award.description} onChange={e => handleDynamicChange(e, index, 'awards')} /> </div> ))} <button onClick={() => addDynamicEntry('awards', { title: '', issuer: '', year: '', description: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Award</button> </EditorSection> ),
    courses: ( <EditorSection title="Courses" primaryColor={primaryColor}> {(cvData.courses || []).map((course, index) => ( <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'courses')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Title" name="title" value={course.title} onChange={e => handleDynamicChange(e, index, 'courses')} /> <EditableField label="Institution (Optional)" name="institution" value={course.institution} onChange={e => handleDynamicChange(e, index, 'courses')} /> <EditableField label="Year (Optional)" name="year" value={course.year} onChange={e => handleDynamicChange(e, index, 'courses')} /> </div> ))} <button onClick={() => addDynamicEntry('courses', { title: '', institution: '', year: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Course</button> </EditorSection> ),
    certifications: ( <EditorSection title="Certifications" primaryColor={primaryColor}> {(cvData.certifications || []).map((cert, index) => ( <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'certifications')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Title" name="title" value={cert.title} onChange={e => handleDynamicChange(e, index, 'certifications')} /> <EditableField label="Issuing Body (Optional)" name="issuingBody" value={cert.issuingBody} onChange={e => handleDynamicChange(e, index, 'certifications')} /> <EditableField label="Year (Optional)" name="year" value={cert.year} onChange={e => handleDynamicChange(e, index, 'certifications')} /> </div> ))} <button onClick={() => addDynamicEntry('certifications', { title: '', issuingBody: '', year: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Certification</button> </EditorSection> ),
    customSections: ( <EditorSection title="Custom Sections" primaryColor={primaryColor}> {(cvData.customSections || []).map((section, index) => ( <div key={index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'customSections')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Header" name="header" value={section.header} onChange={e => handleDynamicChange(e, index, 'customSections')} /> <EditableField label="Content" name="content" isRichText value={section.content} onChange={e => handleDynamicChange(e, index, 'customSections')} /> </div> ))} <button onClick={() => addDynamicEntry('customSections')} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Custom Section</button> </EditorSection> )
  }), [cvData, loadingStates, primaryColor, handleRefine, handleSkillsChange, handleLanguagesChange, handleDynamicChange, addDynamicEntry, removeDynamicEntry, handleGenerateIdeas, cvTextContent, toggleSectionVisibility]);


  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="w-full lg:w-2/5">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">AI Co-Pilot Editor</h2>
          <p className="text-center text-gray-600 mb-8">Use the ✨ magic wand to refine text or add a job description to tailor your CV.</p>

          <EditorSection title="Job Matcher (Optional)" primaryColor={primaryColor}>
            <EditableField label="Paste Job Description Here" name="jobDescription" type="textarea" rows="4" value={cvData.aiHelpers?.jobDescription} onChange={handleJobDescriptionChange} />
            {jobKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-600 mt-4 mb-2">Keywords Found:</h4>
                <div className="flex flex-wrap gap-2">
                  {jobKeywords.map(kw => <KeywordChip key={kw} keyword={kw} isMatched={cvTextContent.includes(kw)} />)}
                </div>
              </div>
            )}
          </EditorSection>

          <EditorSection title="Personal Information" primaryColor={primaryColor}>
             <EditableField label="Full Name" name="name" value={cvData.personalInformation?.name} onChange={handlePersonalInfoChange} />
             <EditableField label="Professional Title" name="professionalTitle" value={cvData.personalInformation?.professionalTitle} onChange={handlePersonalInfoChange} /> 
             <EditableField label="Email" name="email" value={cvData.personalInformation?.email} onChange={handlePersonalInfoChange} />
             <EditableField label="Phone" name="phone" value={cvData.personalInformation?.phone} onChange={handlePersonalInfoChange} />
             <EditableField label="LinkedIn Profile" name="linkedin" value={cvData.personalInformation?.linkedin} onChange={handlePersonalInfoChange} />
             <EditableField label="City" name="city" value={cvData.personalInformation?.city} onChange={handlePersonalInfoChange} />
             <EditableField label="Country" name="country" value={cvData.personalInformation?.country} onChange={handlePersonalInfoChange} />
             <EditableField label="Portfolio/Website Link" name="portfolioLink" value={cvData.personalInformation?.portfolioLink} onChange={handlePersonalInfoChange} />
          </EditorSection>

          {cvData.settings.sectionOrder?.map(sectionId => {
            const sectionContent = sectionComponents[sectionId];
            if (!sectionContent) return null;

            return (
              <div 
                key={sectionId} 
                data-section-id={sectionId} 
                draggable="true" 
                onDragStart={(e) => handleDragStart(e, sectionId)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sectionId)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                className="mb-6 border-2 border-transparent rounded-lg transition-all duration-200 ease-in-out cursor-grab"
              >
                {sectionContent}
              </div>
            );
          })}
          
          <EditorSection title="CV Styling" primaryColor={primaryColor}>
            <div className="mb-4"><label className="block text-sm font-bold text-gray-600 mb-1">Primary Color</label><input type="color" value={cvData.settings?.primaryColor || '#2563EB'} onChange={(e) => handleSettingsChange('primaryColor', e.target.value)} className="w-full h-10 border rounded-md"/></div>
            <div className="mb-4"><label className="block text-sm font-bold text-gray-600 mb-1">Divider Color</label><input type="color" value={cvData.settings?.dividerColor || '#e0e0e0'} onChange={(e) => handleSettingsChange('dividerColor', e.target.value)} className="w-full h-10 border rounded-md"/></div>
            <div className="mb-4"><label className="block text-sm font-bold text-gray-600 mb-1">Header Font Size (pt)</label><input type="number" value={parseFloat((cvData.settings?.headerFontSize || '14pt').replace('pt', ''))} onChange={(e) => handleSettingsChange('headerFontSize', `${e.target.value}pt`)} min="10" max="20" step="0.5" className="w-full p-2 border rounded-md"/></div>
            <div className="mb-4"><label className="block text-sm font-bold text-gray-600 mb-1">Paragraph Font Size (pt)</label><input type="number" value={parseFloat((cvData.settings?.paragraphFontSize || '11pt').replace('pt', ''))} onChange={(e) => handleSettingsChange('paragraphFontSize', `${e.target.value}pt`)} min="8" max="14" step="0.5" className="w-full p-2 border rounded-md"/></div>
            <div className="mb-4"><label className="block text-sm font-bold text-gray-600 mb-1">Line Spacing</label><input type="number" value={parseFloat(cvData.settings?.lineHeight || '1.5')} onChange={(e) => handleSettingsChange('lineHeight', e.target.value)} min="1" max="2" step="0.1" className="w-full p-2 border rounded-md"/></div>
          </EditorSection>

        </div>
      </div>

      <div className="w-full lg:w-3/5 lg:sticky lg:top-8 h-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
           <h3 className="text-xl font-bold mb-3 text-center text-gray-700">Live Preview</h3>
           <div className="h-[80vh] overflow-y-auto bg-gray-50 rounded-lg p-2">
             <PrintableCv ref={previewRef} data={cvData} primaryColor={primaryColor} settings={cvData.settings} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AiCvEditor);
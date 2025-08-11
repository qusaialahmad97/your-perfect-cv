import React, { useState, useMemo, useRef, memo } from 'react';
import { aiService } from '../../services/aiService';
import PrintableCv from './PrintableCv';
import RichTextEditor from '../common/RichTextEditor';

// --- Reusable Components ---

const MagicWandButton = ({ onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="absolute top-1 right-1 p-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        placeholder={`Enter ${label ? label.toLowerCase() : 'content'}...`}
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

const EditorSection = ({ title, children, primaryColor, onReorder }) => (
    <div className="p-4 border rounded-lg mb-6 bg-gray-50/50 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b pb-2" style={{ borderColor: primaryColor }}>
            <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>{title}</h3>
            {onReorder && (
                <button onClick={onReorder} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    Reorder
                </button>
            )}
        </div>
        {children}
    </div>
);

const KeywordChip = ({ keyword, isMatched }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${isMatched ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
    {keyword}
  </span>
);

const ToggleVisibilityButton = ({ isVisible, onClick }) => (
  <button type="button" onClick={onClick} title={isVisible ? "Hide Section" : "Show Section"} className="p-1 text-gray-400 hover:text-gray-600">
    {isVisible ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>)}
  </button>
);

const ReorderSectionsModal = ({ isOpen, onClose, currentOrder, onSaveOrder }) => {
  const [orderedSections, setOrderedSections] = useState(currentOrder);
  const draggedItemIndex = useRef(null);
  const SECTION_NAMES = { summary: 'Professional Summary', experience: 'Work Experience', education: 'Education', projects: 'Projects', skills: 'Skills', languages: 'Languages', references: 'References', awards: 'Awards & Recognitions', courses: 'Courses', certifications: 'Certifications', customSections: 'Custom Sections' };
  
  React.useEffect(() => { setOrderedSections(currentOrder); }, [currentOrder]);
  const handleDragStart = (e, index) => { draggedItemIndex.current = index; e.currentTarget.classList.add('bg-blue-100', 'shadow-md'); };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetIndex) => { e.currentTarget.classList.remove('border-t-2', 'border-blue-500'); const draggedIndex = draggedItemIndex.current; if (draggedIndex === null || draggedIndex === targetIndex) return; const newOrder = [...orderedSections]; const [removed] = newOrder.splice(draggedIndex, 1); newOrder.splice(targetIndex, 0, removed); setOrderedSections(newOrder); draggedItemIndex.current = null; };
  const handleDragEnter = (e, targetIndex) => { if (draggedItemIndex.current !== targetIndex) { e.currentTarget.classList.add('border-t-2', 'border-blue-500'); } };
  const handleDragLeave = (e) => { e.currentTarget.classList.remove('border-t-2', 'border-blue-500'); };
  const handleDragEnd = (e) => { e.currentTarget.classList.remove('bg-blue-100', 'shadow-md'); document.querySelectorAll('.border-t-2.border-blue-500').forEach(el => el.classList.remove('border-t-2', 'border-blue-500')); };
  const handleSave = () => { onSaveOrder(orderedSections); onClose(); };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Reorder Sections</h2> <p className="text-gray-600 mb-6">Drag and drop the sections to change their order on your CV.</p>
        <ul className="space-y-2">
          {orderedSections.map((sectionId, index) => (<li key={sectionId} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} onDragEnter={(e) => handleDragEnter(e, index)} onDragLeave={handleDragLeave} className="flex items-center p-3 border rounded-md bg-gray-50 cursor-grab transition-all"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg> <span className="font-medium text-gray-800">{SECTION_NAMES[sectionId] || sectionId}</span></li>))}
        </ul>
        <div className="mt-8 flex justify-end space-x-4"> <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button> <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Order</button></div>
      </div>
    </div>
  );
};

const ReorderItemsModal = ({ isOpen, onClose, onSave, items, title, itemTitleKey, itemSubtitleKey }) => {
  const [orderedItems, setOrderedItems] = useState(items);
  const draggedItemIndex = useRef(null);
  
  React.useEffect(() => { setOrderedItems(items); }, [items]);
  const handleDragStart = (e, index) => { draggedItemIndex.current = index; e.currentTarget.classList.add('bg-blue-100', 'shadow-md'); };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetIndex) => { e.currentTarget.classList.remove('border-t-2', 'border-blue-500'); const draggedIndex = draggedItemIndex.current; if (draggedIndex === null || draggedIndex === targetIndex) return; const newOrder = [...orderedItems]; const [removed] = newOrder.splice(draggedIndex, 1); newOrder.splice(targetIndex, 0, removed); setOrderedItems(newOrder); draggedItemIndex.current = null; };
  const handleDragEnter = (e, targetIndex) => { if (draggedItemIndex.current !== targetIndex) { e.currentTarget.classList.add('border-t-2', 'border-blue-500'); } };
  const handleDragLeave = (e) => { e.currentTarget.classList.remove('border-t-2', 'border-blue-500'); };
  const handleDragEnd = (e) => { e.currentTarget.classList.remove('bg-blue-100', 'shadow-md'); document.querySelectorAll('.border-t-2.border-blue-500').forEach(el => el.classList.remove('border-t-2', 'border-blue-500')); };
  const handleSave = () => { onSave(orderedItems); onClose(); };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{title}</h2> <p className="text-gray-600 mb-6">Drag and drop the items to change their order.</p>
        <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {orderedItems.map((item, index) => (<li key={item.id || index} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} onDragEnter={(e) => handleDragEnter(e, index)} onDragLeave={handleDragLeave} className="flex items-center p-3 border rounded-md bg-gray-50 cursor-grab transition-all"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg> <div> <span className="font-medium text-gray-800">{item[itemTitleKey] || `Item ${index + 1}`}</span> {item[itemSubtitleKey] && <span className="block text-sm text-gray-500">{item[itemSubtitleKey]}</span>} </div> </li>))}
        </ul>
        <div className="mt-8 flex justify-end space-x-4"> <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button> <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Order</button> </div>
      </div>
    </div>
  );
};

// --- NEW Component for the Refine with Prompt Modal ---
const RefinePromptModal = ({ isOpen, onClose, onRefine, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const quickPrompts = ["Make it more professional", "Shorten this", "Use stronger action verbs", "Rephrase as bullet points"];

    const handleRefineClick = () => {
        onRefine(prompt);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-2">Refine with AI</h2>
                <p className="text-gray-600 mb-4">Give the AI a specific instruction, or leave it blank for a general improvement.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Shorten this to three bullet points..."
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 resize-y"
                    rows="3"
                />
                <div className="mt-3 mb-6 flex flex-wrap gap-2">
                    {quickPrompts.map(p => (
                        <button key={p} onClick={() => setPrompt(p)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">
                            {p}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                    <button onClick={handleRefineClick} disabled={isLoading} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:animate-pulse">
                        {isLoading ? 'Refining...' : '✨ Refine'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Editor Component ---
const AiCvEditor = ({ cvData, setCvData }) => {
  const previewRef = useRef(null);
  const [loadingStates, setLoadingStates] = useState({});
  const primaryColor = cvData.settings?.primaryColor || '#2563EB';
  const [isSectionReorderModalOpen, setIsSectionReorderModalOpen] = useState(false);
  const [itemReorderModal, setItemReorderModal] = useState({ isOpen: false, sectionKey: null, title: '', items: [], itemTitleKey: '', itemSubtitleKey: '' });

  // --- NEW state for the refine prompt modal ---
  const [refineModalState, setRefineModalState] = useState({ isOpen: false, fieldName: null, currentValue: '', updateFn: null, isRichText: false });

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
    (cvData.experience || []).forEach(exp => { combinedText += htmlToPlainText(exp.responsibilities) + ' ' + htmlToPlainText(exp.achievements) + ' '; });
    (cvData.projects || []).forEach(proj => { combinedText += htmlToPlainText(proj.description) + ' '; });
    (cvData.customSections || []).forEach(section => { combinedText += htmlToPlainText(section.content) + ' '; });
    combinedText += Object.values(cvData.skills || {}).join(' ') + ' ';
    combinedText += cvData.languages + ' ';
    return combinedText.toLowerCase();
  }, [cvData]);

  const handleSettingsChange = (settingKey, value) => setCvData(prev => ({ ...prev, settings: { ...(prev.settings || {}), [settingKey]: value } }));
  
  const plainTextToHtml = (text) => {
    if (!text) return '<p><br></p>';
    return text.split('\n').filter(line => line.trim() !== '').map(line => `<p>${line}</p>`).join('');
  };

  // --- MODIFIED: This function now just opens the modal ---
  const handleOpenRefineModal = (fieldName, currentValue, updateFn, isRichText = false) => {
    if (!currentValue) return;
    setRefineModalState({ isOpen: true, fieldName, currentValue, updateFn, isRichText });
  };

  // --- NEW: This function contains the logic to call the AI service ---
  const handleExecuteRefine = async (prompt) => {
    const { fieldName, currentValue, updateFn, isRichText } = refineModalState;
    if (!currentValue) return;

    setLoadingStates(prev => ({ ...prev, [fieldName]: true }));
    try {
      const refinedText = await aiService.refineText(currentValue, cvData.aiHelpers?.jobDescription, prompt);
      const finalValue = isRichText ? plainTextToHtml(refinedText) : refinedText;
      updateFn(finalValue);
    } catch (error) {
      console.error(`Error refining text for ${fieldName}:`, error);
      alert(`Error refining text: ${error.message}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [fieldName]: false }));
      setRefineModalState({ isOpen: false, fieldName: null, currentValue: '', updateFn: null, isRichText: false }); // Close and reset modal state
    }
  };
  
  const handleGenerateIdeas = async (index, jobTitle) => { if (!jobTitle) return; const fieldName = `experienceIdeas-${index}`; setLoadingStates(prev => ({ ...prev, [fieldName]: true })); try { const ideas = await aiService.generateIdeas(jobTitle); const existingResponsibilities = cvData.experience[index].responsibilities || '<p></p>'; const newResponsibilities = existingResponsibilities.replace('</p>', '') + ideas + '</p>'; handleDynamicChange({ target: { name: 'responsibilities', value: newResponsibilities } }, index, 'experience'); } catch (error) { console.error(`Error generating ideas for ${jobTitle}:`, error); alert(`Error generating ideas: ${error.message}`); } finally { setLoadingStates(prev => ({ ...prev, [fieldName]: false })); } };
  const handlePersonalInfoChange = (e) => { const { name, value } = e.target; setCvData(prev => ({...prev, personalInformation: { ...prev.personalInformation, [name]: value }})); };
  const handleSummaryChange = (e) => setCvData(prev => ({ ...prev, summary: e.target.value }));
  const handleSkillsChange = (e) => { const { name, value } = e.target; setCvData(prev => ({ ...prev, skills: { ...prev.skills, [name]: value }})); };
  const handleLanguagesChange = (e) => setCvData(prev => ({ ...prev, languages: e.target.value }));
  const handleDynamicChange = (e, index, section) => {
    const { name, value } = e.target;
    setCvData(prev => {
        const newSectionData = [...(prev[section] || [])];
        newSectionData[index] = { ...newSectionData[index], [name]: value };
        return { ...prev, [section]: newSectionData };
    });
  };
  const toggleSectionVisibility = (index, sectionKey, flagKey) => setCvData(prev => { const newSectionData = JSON.parse(JSON.stringify(prev[sectionKey] || [])); newSectionData[index][flagKey] = !(newSectionData[index][flagKey] !== false); return { ...prev, [sectionKey]: newSectionData }; });
  const addDynamicEntry = (section, defaultData = {}) => {
    let entryData = defaultData;
    if (section === 'experience') { entryData = { role: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '<p></p>', achievements: '<p></p>', showResponsibilities: true, showAchievements: true, id: `exp_${Date.now()}`, ...defaultData }; }
    else if (section === 'projects') { entryData = { name: '', technologies: '', description: '<p></p>', id: `proj_${Date.now()}`, ...defaultData }; }
    else if (section === 'education') { entryData = { id: `edu_${Date.now()}`, degree: '', institution: '', graduationYear: '', location: '', ...defaultData }; }
    else if (section === 'customSections') { entryData = { header: 'New Custom Section', content: '<p></p>', id: `cust_${Date.now()}`, ...defaultData }; }
    setCvData(prev => ({ ...prev, [section]: [...(prev[section] || []), entryData] }));
  };
  const removeDynamicEntry = (index, section) => setCvData(prev => ({ ...prev, [section]: (prev[section] || []).filter((_, i) => i !== index) }));
  const handleJobDescriptionChange = (e) => setCvData(prev => ({...prev, aiHelpers: {...prev.aiHelpers, jobDescription: e.target.value }}));
  const handleSaveSectionOrder = (newOrder) => setCvData(prev => ({ ...prev, settings: { ...prev.settings, sectionOrder: newOrder } }));
  const handleSaveItemOrder = (sectionKey, newItems) => { setCvData(prev => ({ ...prev, [sectionKey]: newItems })); };

  const sectionComponents = useMemo(() => ({
    summary: (
      <EditorSection title="Professional Summary" primaryColor={primaryColor}>
        <EditableField label="Summary" name="summary" isRichText value={cvData.summary} onChange={handleSummaryChange} onRefine={() => handleOpenRefineModal('summary', cvData.summary, (v) => setCvData(p => ({...p, summary: v})), true)} isRefining={loadingStates['summary']} />
      </EditorSection>
    ),
    experience: (
      <EditorSection title="Work Experience" primaryColor={primaryColor} onReorder={() => setItemReorderModal({ isOpen: true, sectionKey: 'experience', title: 'Reorder Work Experience', items: cvData.experience || [], itemTitleKey: 'role', itemSubtitleKey: 'company' })}>
        {(cvData.experience || []).map((exp, index) => (
          <div key={exp.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3">
             <button onClick={() => removeDynamicEntry(index, 'experience')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
             <EditableField label="Job Title" name="role" value={exp.role || exp.jobTitle || ''} onChange={e => handleDynamicChange(e, index, 'experience')} />
             <EditableField label="Company" name="company" value={exp.company || ''} onChange={e => handleDynamicChange(e, index, 'experience')} />
             <EditableField label="Location" name="location" value={exp.location || ''} onChange={e => handleDynamicChange(e, index, 'experience')} />
             <div className="flex gap-4">
                <EditableField label="Start Date" name="startDate" value={exp.startDate || ''} onChange={e => handleDynamicChange(e, index, 'experience')} />
                <EditableField label="End Date" name="endDate" value={exp.endDate || ''} onChange={e => handleDynamicChange(e, index, 'experience')} />
             </div>
             <div className="flex justify-between items-center"><label className="block text-sm font-bold text-gray-600 mb-1">Responsibilities</label><ToggleVisibilityButton isVisible={exp.showResponsibilities !== false} onClick={() => toggleSectionVisibility(index, 'experience', 'showResponsibilities')} /></div>
             {(exp.showResponsibilities !== false) && (<EditableField label="" name="responsibilities" isRichText value={exp.responsibilities} onChange={e => handleDynamicChange(e, index, 'experience')} onRefine={() => handleOpenRefineModal(`expResp-${index}`, exp.responsibilities, v => handleDynamicChange({target: {name:'responsibilities', value:v}}, index, 'experience'), true)} isRefining={loadingStates[`expResp-${index}`]} />)}
             <div className="flex justify-between items-center mt-2"><label className="block text-sm font-bold text-gray-600 mb-1">Achievements</label><ToggleVisibilityButton isVisible={exp.showAchievements !== false} onClick={() => toggleSectionVisibility(index, 'experience', 'showAchievements')} /></div>
             {(exp.showAchievements !== false) && (<EditableField label="" name="achievements" isRichText value={exp.achievements} onChange={e => handleDynamicChange(e, index, 'experience')} onRefine={() => handleOpenRefineModal(`expAchv-${index}`, exp.achievements, v => handleDynamicChange({target: {name:'achievements', value:v}}, index, 'experience'), true)} isRefining={loadingStates[`expAchv-${index}`]} />)}
             {(!exp.responsibilities || exp.responsibilities === '<p></p>') && (exp.role || exp.jobTitle) && (<button onClick={() => handleGenerateIdeas(index, exp.role || exp.jobTitle)} disabled={loadingStates[`experienceIdeas-${index}`]} className="w-full text-xs py-1 px-2 mt-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md">{loadingStates[`experienceIdeas-${index}`] ? 'Generating Ideas...' : '🤖 Generate Responsibility Ideas'}</button>)}
          </div>
        ))}
        <button onClick={() => addDynamicEntry('experience')} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Work Experience</button>
      </EditorSection>
    ),
    education: (
      <EditorSection title="Education" primaryColor={primaryColor} onReorder={() => setItemReorderModal({ isOpen: true, sectionKey: 'education', title: 'Reorder Education', items: cvData.education || [], itemTitleKey: 'degree', itemSubtitleKey: 'institution' })}>
        {(cvData.education || []).map((edu, index) => (
          <div key={edu.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3">
             <button onClick={() => removeDynamicEntry(index, 'education')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
             <EditableField label="Degree / Program" name="degree" value={edu.degree || ''} onChange={(e) => handleDynamicChange(e, index, 'education')} />
             <EditableField label="Institution" name="institution" value={edu.institution || ''} onChange={(e) => handleDynamicChange(e, index, 'education')} />
             <EditableField label="Graduation Year" name="graduationYear" value={edu.graduationYear || edu.gradDate || edu.year || ''} onChange={(e) => handleDynamicChange(e, index, 'education')} />
             <EditableField label="Location (Optional)" name="location" value={edu.location || ''} onChange={(e) => handleDynamicChange(e, index, 'education')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('education')} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Education</button>
      </EditorSection>
    ),
    projects: ( <EditorSection title="Projects" primaryColor={primaryColor}> {(cvData.projects || []).map((project, index) => ( <div key={project.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'projects')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Project Name" name="name" value={project.name} onChange={e => handleDynamicChange(e, index, 'projects')} /> <EditableField label="Technologies Used" name="technologies" value={project.technologies} onChange={e => handleDynamicChange(e, index, 'projects')} /> <EditableField label="Description" name="description" isRichText value={project.description} onChange={e => handleDynamicChange(e, index, 'projects')} onRefine={() => handleOpenRefineModal(`projDesc-${index}`, project.description, v => handleDynamicChange({target: {name:'description', value:v}}, index, 'projects'), true)} isRefining={loadingStates[`projDesc-${index}`]}/> </div> ))} <button onClick={() => addDynamicEntry('projects')} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Project</button> </EditorSection> ),
    skills: ( <EditorSection title="Skills" primaryColor={primaryColor}> <EditableField label="Technical Skills" name="technical" type="textarea" value={cvData.skills?.technical} onChange={handleSkillsChange} onRefine={() => handleOpenRefineModal('techSkills', cvData.skills?.technical, v => handleSkillsChange({target: {name:'technical', value:v}}))} isRefining={loadingStates['techSkills']} /> <EditableField label="Soft Skills" name="soft" type="textarea" value={cvData.skills?.soft} onChange={handleSkillsChange} onRefine={() => handleOpenRefineModal('softSkills', cvData.skills?.soft, v => handleSkillsChange({target: {name:'soft', value:v}}))} isRefining={loadingStates['softSkills']} /> </EditorSection> ),
    languages: ( <EditorSection title="Languages" primaryColor={primaryColor}> <EditableField label="Languages" name="languages" type="textarea" value={cvData.languages} onChange={handleLanguagesChange} /> </EditorSection> ),
    references: ( <EditorSection title="References" primaryColor={primaryColor}> {(cvData.references || []).map((ref, index) => ( <div key={ref.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'references')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Name" name="name" value={ref.name} onChange={e => handleDynamicChange(e, index, 'references')} /> <EditableField label="Position" name="position" value={ref.position} onChange={e => handleDynamicChange(e, index, 'references')} /> <EditableField label="Phone Number" name="phone" value={ref.phone} onChange={e => handleDynamicChange(e, index, 'references')} /> </div> ))} <button onClick={() => addDynamicEntry('references', { name: '', phone: '', position: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Reference</button> </EditorSection> ),
    awards: ( <EditorSection title="Awards & Recognitions" primaryColor={primaryColor}> {(cvData.awards || []).map((award, index) => ( <div key={award.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'awards')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Title" name="title" value={award.title} onChange={e => handleDynamicChange(e, index, 'awards')} /> <EditableField label="Issuer (Optional)" name="issuer" value={award.issuer} onChange={e => handleDynamicChange(e, index, 'awards')} /> <EditableField label="Year (Optional)" name="year" value={award.year} onChange={e => handleDynamicChange(e, index, 'awards')} /> <EditableField label="Description (Optional)" name="description" type="textarea" rows="2" value={award.description} onChange={e => handleDynamicChange(e, index, 'awards')} /> </div> ))} <button onClick={() => addDynamicEntry('awards', { title: '', issuer: '', year: '', description: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Award</button> </EditorSection> ),
    courses: ( <EditorSection title="Courses" primaryColor={primaryColor}> {(cvData.courses || []).map((course, index) => ( <div key={course.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'courses')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Title" name="title" value={course.title} onChange={e => handleDynamicChange(e, index, 'courses')} /> <EditableField label="Institution (Optional)" name="institution" value={course.institution} onChange={e => handleDynamicChange(e, index, 'courses')} /> <EditableField label="Year (Optional)" name="year" value={course.year} onChange={e => handleDynamicChange(e, index, 'courses')} /> </div> ))} <button onClick={() => addDynamicEntry('courses', { title: '', institution: '', year: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Course</button> </EditorSection> ),
    certifications: ( <EditorSection title="Certifications" primaryColor={primaryColor}> {(cvData.certifications || []).map((cert, index) => ( <div key={cert.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'certifications')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Title" name="title" value={cert.title} onChange={e => handleDynamicChange(e, index, 'certifications')} /> <EditableField label="Issuing Body (Optional)" name="issuingBody" value={cert.issuingBody} onChange={e => handleDynamicChange(e, index, 'certifications')} /> <EditableField label="Year (Optional)" name="year" value={cert.year} onChange={e => handleDynamicChange(e, index, 'certifications')} /> </div> ))} <button onClick={() => addDynamicEntry('certifications', { title: '', issuingBody: '', year: '' })} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Certification</button> </EditorSection> ),
    customSections: ( <EditorSection title="Custom Sections" primaryColor={primaryColor}> {(cvData.customSections || []).map((section, index) => ( <div key={section.id || index} className="p-3 border-b last:border-b-0 relative bg-white rounded-md mb-3"> <button onClick={() => removeDynamicEntry(index, 'customSections')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-100 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button> <EditableField label="Header" name="header" value={section.header} onChange={e => handleDynamicChange(e, index, 'customSections')} /> <EditableField label="Content" name="content" isRichText value={section.content} onChange={e => handleDynamicChange(e, index, 'customSections')} onRefine={() => handleOpenRefineModal(`custCont-${index}`, section.content, v => handleDynamicChange({target: {name:'content', value:v}}, index, 'customSections'), true)} isRefining={loadingStates[`custCont-${index}`]}/> </div> ))} <button onClick={() => addDynamicEntry('customSections')} className="w-full mt-2 flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Custom Section</button> </EditorSection> )
  }), [cvData, loadingStates, primaryColor]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="w-full lg:w-2/5">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">AI Co-Pilot Editor</h2>
            <p className="text-gray-600">Use the ✨ magic wand to refine text or add a job description to tailor your CV.</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg mb-6 flex items-center justify-between">
            <span className="font-semibold text-gray-700">Editor Actions</span>
            <button onClick={() => setIsSectionReorderModalOpen(true)} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Reorder Sections
            </button>
          </div>
          <EditorSection title="Job Matcher (Optional)" primaryColor={primaryColor}>
            <EditableField label="Paste Job Description Here" name="jobDescription" type="textarea" rows="4" value={cvData.aiHelpers?.jobDescription} onChange={handleJobDescriptionChange} />
            {jobKeywords.length > 0 && (<div><h4 className="text-sm font-bold text-gray-600 mt-4 mb-2">Keywords Found:</h4><div className="flex flex-wrap gap-2">{jobKeywords.map(kw => <KeywordChip key={kw} keyword={kw} isMatched={cvTextContent.includes(kw)} />)}</div></div>)}
          </EditorSection>
          <EditorSection title="Personal Information" primaryColor={primaryColor}>
             <EditableField label="Full Name" name="name" value={cvData.personalInformation?.name} onChange={handlePersonalInfoChange} /> <EditableField label="Professional Title" name="professionalTitle" value={cvData.personalInformation?.professionalTitle} onChange={handlePersonalInfoChange} /> <EditableField label="Email" name="email" value={cvData.personalInformation?.email} onChange={handlePersonalInfoChange} /> <EditableField label="Phone" name="phone" value={cvData.personalInformation?.phone} onChange={handlePersonalInfoChange} /> <EditableField label="LinkedIn Profile" name="linkedin" value={cvData.personalInformation?.linkedin} onChange={handlePersonalInfoChange} /> <EditableField label="City" name="city" value={cvData.personalInformation?.city} onChange={handlePersonalInfoChange} /> <EditableField label="Country" name="country" value={cvData.personalInformation?.country} onChange={handlePersonalInfoChange} /> <EditableField label="Portfolio/Website Link" name="portfolioLink" value={cvData.personalInformation?.portfolioLink} onChange={handlePersonalInfoChange} />
          </EditorSection>

          {cvData.settings.sectionOrder?.map(sectionId => { const sectionContent = sectionComponents[sectionId]; if (!sectionContent) return null; return <div key={sectionId}>{sectionContent}</div>; })}
          
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
      <ReorderSectionsModal isOpen={isSectionReorderModalOpen} onClose={() => setIsSectionReorderModalOpen(false)} currentOrder={cvData.settings.sectionOrder || []} onSaveOrder={handleSaveSectionOrder} />
      <ReorderItemsModal
        isOpen={itemReorderModal.isOpen}
        onClose={() => setItemReorderModal({ isOpen: false, sectionKey: null, items: [] })}
        onSave={(newItems) => handleSaveItemOrder(itemReorderModal.sectionKey, newItems)}
        items={itemReorderModal.items}
        title={itemReorderModal.title}
        itemTitleKey={itemReorderModal.itemTitleKey}
        itemSubtitleKey={itemReorderModal.itemSubtitleKey}
      />
      {/* --- NEW: Render the Refine Prompt Modal --- */}
      <RefinePromptModal
        isOpen={refineModalState.isOpen}
        onClose={() => setRefineModalState({ isOpen: false, fieldName: null, currentValue: '', updateFn: null, isRichText: false })}
        onRefine={handleExecuteRefine}
        isLoading={loadingStates[refineModalState.fieldName]}
      />
    </div>
  );
};

export default memo(AiCvEditor);
// src/components/cv/ManualCvForm.jsx

import React from 'react';

// Reusable Field Component (Updated for Light Mode Only)
const FormField = ({ label, value, onChange, name, type = 'text', rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 bg-white text-gray-900"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 bg-white text-gray-900"
      />
    )}
  </div>
);

// Reusable Section Component
const FormSection = ({ title, children, primaryColor = '#2563EB' }) => (
  <div className="p-4 border rounded-lg mb-6 bg-gray-50/50">
    <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2" style={{ borderColor: primaryColor, color: primaryColor }}>{title}</h3>
    {children}
  </div>
);

const ManualCvForm = ({ cvData, setCvData }) => {

  // Derive primaryColor from cvData.settings for consistency in section headers
  const primaryColor = cvData.settings?.primaryColor || '#2563EB';

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({...prev, personalInformation: { ...prev.personalInformation, [name]: value }}));
  };

  const handleSummaryChange = (e) => {
    setCvData(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({ ...prev, skills: { ...prev.skills, [name]: value }}));
  };

  // Generic handler for dynamic arrays like experience, education, references, awards, etc.
  const handleDynamicChange = (e, index, section) => {
    const { name, value } = e.target;
    setCvData(prev => {
        const newSectionData = [...(prev[section] || [])];
        newSectionData[index] = { ...newSectionData[index], [name]: value };
        return { ...prev, [section]: newSectionData };
    });
  };

  const addDynamicEntry = (section, defaultData = {}) => {
    setCvData(prev => ({...prev, [section]: [...(prev[section] || []), defaultData]}));
  };

  const removeDynamicEntry = (index, section) => {
    const newSectionData = [...(cvData[section] || [])].filter((_, i) => i !== index);
    setCvData(prev => ({ ...prev, [section]: newSectionData }));
  };

  // Handler for settings changes
  const handleSettingsChange = (settingKey, value) => {
    setCvData(prev => ({
        ...prev,
        settings: {
            ...(prev.settings || {}),
            [settingKey]: value
        }
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto border border-gray-200">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">CV Editor</h2>
      <p className="text-center text-gray-600 mb-8">Fill out the fields below. You can download a preview from the header. All changes are saved automatically.</p>

      <FormSection title="Personal Information" primaryColor={primaryColor}>
        <FormField label="Full Name" name="name" value={cvData.personalInformation?.name} onChange={handlePersonalInfoChange} />
        <FormField label="Email" name="email" value={cvData.personalInformation?.email} onChange={handlePersonalInfoChange} />
        <FormField label="Phone" name="phone" value={cvData.personalInformation?.phone} onChange={handlePersonalInfoChange} />
        <FormField label="LinkedIn Profile" name="linkedin" value={cvData.personalInformation?.linkedin} onChange={handlePersonalInfoChange} />
        <FormField label="City" name="city" value={cvData.personalInformation?.city} onChange={handlePersonalInfoChange} />
        <FormField label="Country" name="country" value={cvData.personalInformation?.country} onChange={handlePersonalInfoChange} />
        <FormField label="Portfolio/Website Link" name="portfolioLink" value={cvData.personalInformation?.portfolioLink} onChange={handlePersonalInfoChange} />
      </FormSection>

      <FormSection title="Professional Summary" primaryColor={primaryColor}>
        <FormField label="Summary" name="summary" type="textarea" rows="5" value={cvData.summary} onChange={handleSummaryChange} />
      </FormSection>

      <FormSection title="Work Experience" primaryColor={primaryColor}>
        {(cvData.experience || []).map((exp, index) => (
          <div key={index} className="p-3 border rounded-md mb-3 bg-white relative">
            <button onClick={() => removeDynamicEntry(index, 'experience')} className="absolute top-2 right-2 text-red-500 p-1 rounded-full bg-red-100">🗑️</button>
            <FormField label="Job Title" name="jobTitle" value={exp.jobTitle} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
            <FormField label="Company" name="company" value={exp.company} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
            <FormField label="Duration" name="duration" value={exp.duration} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
            <FormField label="Responsibilities" name="responsibilities" type="textarea" value={exp.responsibilities} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
            <FormField label="Achievements" name="achievements" type="textarea" value={exp.achievements} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('experience', { jobTitle: '', company: '', duration: '', responsibilities: '', achievements: '' })} className="w-full mt-2 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Work Experience</button>
      </FormSection>

      <FormSection title="Education" primaryColor={primaryColor}>
        {(cvData.education || []).map((edu, index) => (
          <div key={index} className="p-3 border rounded-md mb-3 bg-white relative">
            <button onClick={() => removeDynamicEntry(index, 'education')} className="absolute top-2 right-2 text-red-500 p-1 rounded-full bg-red-100">🗑️</button>
            <FormField label="Degree" name="degree" value={edu.degree} onChange={(e) => handleDynamicChange(e, index, 'education')} />
            <FormField label="Institution" name="institution" value={edu.institution} onChange={(e) => handleDynamicChange(e, index, 'education')} />
            <FormField label="Graduation Date" name="gradDate" value={edu.gradDate} onChange={(e) => handleDynamicChange(e, index, 'education')} />
            <FormField label="GPA (Optional)" name="gpa" value={edu.gpa} onChange={(e) => handleDynamicChange(e, index, 'education')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('education', { degree: '', institution: '', gradDate: '', gpa: '' })} className="w-full mt-2 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Education</button>
      </FormSection>

      <FormSection title="Skills" primaryColor={primaryColor}>
        <FormField label="Technical Skills" name="technical" type="textarea" value={cvData.skills?.technical} onChange={handleSkillsChange} />
        <FormField label="Soft Skills" name="soft" type="textarea" value={cvData.skills?.soft} onChange={handleSkillsChange} />
        <FormField label="Languages" name="languages" type="textarea" value={cvData.skills?.languages} onChange={handleSkillsChange} />
      </FormSection>

      {/* --- NEW SECTIONS IN MANUAL FORM UI --- */}
      <FormSection title="References" primaryColor={primaryColor}>
        {(cvData.references || []).map((ref, index) => (
          <div key={index} className="p-3 border rounded-md mb-3 bg-white relative">
            <button onClick={() => removeDynamicEntry(index, 'references')} className="absolute top-2 right-2 text-red-500 p-1 rounded-full bg-red-100">🗑️</button>
            <FormField label="Name" name="name" value={ref.name} onChange={e => handleDynamicChange(e, index, 'references')} />
            <FormField label="Position (Optional)" name="position" value={ref.position} onChange={e => handleDynamicChange(e, index, 'references')} />
            <FormField label="Phone Number (Optional)" name="phone" value={ref.phone} onChange={e => handleDynamicChange(e, index, 'references')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('references', { name: '', phone: '', position: '' })} className="w-full mt-2 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Reference</button>
      </FormSection>

      <FormSection title="Awards & Recognitions" primaryColor={primaryColor}>
        {(cvData.awards || []).map((award, index) => (
          <div key={index} className="p-3 border rounded-md mb-3 bg-white relative">
            <button onClick={() => removeDynamicEntry(index, 'awards')} className="absolute top-2 right-2 text-red-500 p-1 rounded-full bg-red-100">🗑️</button>
            <FormField label="Title" name="title" value={award.title} onChange={e => handleDynamicChange(e, index, 'awards')} />
            <FormField label="Issuer (Optional)" name="issuer" value={award.issuer} onChange={e => handleDynamicChange(e, index, 'awards')} />
            <FormField label="Year (Optional)" name="year" value={award.year} onChange={e => handleDynamicChange(e, index, 'awards')} />
            <FormField label="Description (Optional)" name="description" type="textarea" rows="2" value={award.description} onChange={e => handleDynamicChange(e, index, 'awards')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('awards', { title: '', issuer: '', year: '', description: '' })} className="w-full mt-2 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Award</button>
      </FormSection>

      <FormSection title="Courses" primaryColor={primaryColor}>
        {(cvData.courses || []).map((course, index) => (
          <div key={index} className="p-3 border rounded-md mb-3 bg-white relative">
            <button onClick={() => removeDynamicEntry(index, 'courses')} className="absolute top-2 right-2 text-red-500 p-1 rounded-full bg-red-100">🗑️</button>
            <FormField label="Title" name="title" value={course.title} onChange={e => handleDynamicChange(e, index, 'courses')} />
            <FormField label="Institution (Optional)" name="institution" value={course.institution} onChange={e => handleDynamicChange(e, index, 'courses')} />
            <FormField label="Year (Optional)" name="year" value={course.year} onChange={e => handleDynamicChange(e, index, 'courses')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('courses', { title: '', institution: '', year: '' })} className="w-full mt-2 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Course</button>
      </FormSection>

      <FormSection title="Certifications" primaryColor={primaryColor}>
        {(cvData.certifications || []).map((cert, index) => (
          <div key={index} className="p-3 border rounded-md mb-3 bg-white relative">
            <button onClick={() => removeDynamicEntry(index, 'certifications')} className="absolute top-2 right-2 text-red-500 p-1 rounded-full bg-red-100">🗑️</button>
            <FormField label="Title" name="title" value={cert.title} onChange={e => handleDynamicChange(e, index, 'certifications')} />
            <FormField label="Issuing Body (Optional)" name="issuingBody" value={cert.issuingBody} onChange={e => handleDynamicChange(e, index, 'certifications')} />
            <FormField label="Year (Optional)" name="year" value={cert.year} onChange={e => handleDynamicChange(e, index, 'certifications')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('certifications', { title: '', issuingBody: '', year: '' })} className="w-full mt-2 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Certification</button>
      </FormSection>

      <FormSection title="Custom Sections" primaryColor={primaryColor}>
        {(cvData.customSections || []).map((section, index) => (
          <div key={index} className="p-3 border rounded-md mb-3 bg-white relative">
            <button onClick={() => removeDynamicEntry(index, 'customSections')} className="absolute top-2 right-2 text-red-500 p-1 rounded-full bg-red-100">🗑️</button>
            <FormField label="Header" name="header" value={section.header} onChange={e => handleDynamicChange(e, index, 'customSections')} />
            <FormField label="Content" name="content" type="textarea" rows="4" value={section.content} onChange={e => handleDynamicChange(e, index, 'customSections')} />
          </div>
        ))}
        <button onClick={() => addDynamicEntry('customSections', { header: 'New Custom Section', content: '' })} className="w-full mt-2 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">+ Add Custom Section</button>
      </FormSection>

      {/* --- NEW STYLING CONTROLS FOR MANUAL MODE --- */}
      <FormSection title="CV Styling" primaryColor={primaryColor}>
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600 mb-1">Primary Color</label>
                <input
                    type="color"
                    value={cvData.settings?.primaryColor || '#2563EB'}
                    onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                    className="w-full h-10 border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600 mb-1">Divider Color</label>
                <input
                    type="color"
                    value={cvData.settings?.dividerColor || '#e0e0e0'}
                    onChange={(e) => handleSettingsChange('dividerColor', e.target.value)}
                    className="w-full h-10 border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600 mb-1">Font Size (pt)</label>
                <input
                    type="number"
                    value={parseFloat((cvData.settings?.fontSize || '11pt').replace('pt', ''))}
                    onChange={(e) => handleSettingsChange('fontSize', `${e.target.value}pt`)}
                    min="8"
                    max="14"
                    step="0.5"
                    className="w-full p-2 border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600 mb-1">Line Spacing</label>
                <input
                    type="number"
                    value={parseFloat(cvData.settings?.lineHeight || '1.5')}
                    onChange={(e) => handleSettingsChange('lineHeight', e.target.value)}
                    min="1"
                    max="2"
                    step="0.1"
                    className="w-full p-2 border rounded-md"
                />
            </div>
          </FormSection>
    </div>
  );
};

export default ManualCvForm;
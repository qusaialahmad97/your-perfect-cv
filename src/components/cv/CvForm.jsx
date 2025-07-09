// src/components/cv/CvForm.jsx

import React from 'react';

const CvForm = ({
    currentStep, allSteps, cvData, primaryColor, fontFamily, selectedTemplate, templates, saveStatus, openDynamicEntries,
    setPrimaryColor, setFontFamily, handleTemplateSelection, nextStep, prevStep, refineCvWithAI, showManualResult,
    handleChange, handleDynamicChange, addDynamicEntry, removeDynamicEntry, toggleDynamicEntry, isAiLoading
}) => {
    const step = allSteps[currentStep];

    const renderFields = (fields, nestedKey) => {
        if (!fields) return null;
        return fields.map(field => {
            if (field.fields) {
                return (
                    <div key={field.id} className="p-4 border rounded-md bg-gray-50">
                        <h3 className="text-lg font-semibold mb-3">{field.label}</h3>
                        <div className="space-y-4">{renderFields(field.fields, field.id)}</div>
                    </div>
                );
            }
            const val = nestedKey ? cvData[nestedKey]?.[field.id] || '' : cvData[field.id] || '';
            return (
                <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium mb-1">{field.label}{field.required && <span className="text-red-500">*</span>}</label>
                    {field.type === 'textarea' ? (
                        <textarea id={field.id} rows="4" value={val} onChange={(e) => handleChange(e, nestedKey)} placeholder={field.placeholder} className={`mt-1 block w-full p-2 border rounded-md shadow-sm resize-y border-gray-300`} />
                    ) : (
                        <input type={field.type || 'text'} id={field.id} value={val} onChange={(e) => handleChange(e, nestedKey)} placeholder={field.placeholder} className={`mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300`} />
                    )}
                </div>
            );
        });
    };

    if (step.isTemplateSelection) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto border border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">{step.title}</h2>
                <div className="mb-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <div><label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">Primary Color:</label><input type="color" id="primaryColor" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-16 rounded-full border-2 cursor-pointer shadow-md" /></div>
                    <div><label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-2">Font Family:</label><select id={fontFamily} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md shadow-sm"><option>Inter</option><option value="Roboto, sans-serif">Roboto</option><option value="Open Sans, sans-serif">Open Sans</option></select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {templates.map((t) => (<div key={t.id} className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center text-center transition-all ${selectedTemplate === t.id ? 'ring-4 scale-105' : 'border-gray-300 hover:shadow-md'}`} style={{ borderColor: selectedTemplate === t.id ? primaryColor : undefined, '--tw-ring-color': primaryColor + '30' }} onClick={() => handleTemplateSelection(t.id)}><h3 className="text-xl font-semibold mb-3">{t.name}</h3><img src={t.imageUrl} alt={t.name} className="w-full h-48 object-cover rounded-md mb-4 shadow-sm" /><button className={`mt-2 py-2 px-4 rounded-md text-sm font-medium ${selectedTemplate === t.id ? 'text-white' : 'bg-gray-200 text-gray-700'}`} style={{ backgroundColor: selectedTemplate === t.id ? primaryColor : undefined }}>{selectedTemplate === t.id ? 'Selected' : 'Select Template'}</button></div>))}
                </div>
                <div className="flex justify-end items-center mt-8 gap-4">
                    <button onClick={nextStep} className="ml-2 py-2 px-4 text-sm font-medium rounded-md text-white" style={{ backgroundColor: primaryColor }}>Next (Start Filling Data)</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto`}>
            <div className="bg-white p-6 rounded-xl shadow-lg flex-1 border border-gray-200 lg:max-w-[50%]">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">{step.title}</h2>
                {step.description && <p className="text-gray-600 text-center mb-4">{step.description}</p>}
                <div className="space-y-6">
                    {step.isDynamic ? (
                        <>
                            {(cvData[step.dataKey] || []).map((entry, index) => {
                                const entryKey = `${step.dataKey}-${index}`;
                                const isOpen = openDynamicEntries[entryKey] || false;
                                let entrySummary = entry.jobTitle || entry.degree || entry.projectName || `Entry ${index + 1}`;
                                return (
                                    <div key={index} className="border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 rounded-t-lg" onClick={() => toggleDynamicEntry(step.dataKey, index)}>
                                            <h3 className="text-lg font-semibold truncate pr-2">{entrySummary}</h3>
                                            <button onClick={(e) => { e.stopPropagation(); removeDynamicEntry(index, step.dataKey); }} className="text-red-500 p-1 rounded-full bg-red-100">🗑</button>
                                        </div>
                                        {isOpen && (
                                            <div className="p-4 relative space-y-4">
                                                {step.fields.map(field => {
                                                    const val = entry[field.id] || '';
                                                    return (
                                                        <div key={field.id} className="mb-4">
                                                            <label htmlFor={`${step.dataKey}-${field.id}-${index}`} className="block text-sm font-medium mb-1">{field.label}{field.required && <span className="text-red-500">*</span>}</label>
                                                            {field.type === 'textarea' ? (<textarea id={field.id} rows="3" value={val} onChange={(e) => handleDynamicChange(e, index, field.id, step.dataKey)} placeholder={field.placeholder} className={`mt-1 block w-full p-2 border rounded-md shadow-sm resize-y border-gray-300`} />) : (<input type={field.type || 'text'} id={field.id} value={val} onChange={(e) => handleDynamicChange(e, index, field.id, step.dataKey)} placeholder={field.placeholder} className={`mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300`} />)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button onClick={() => addDynamicEntry(step.dataKey)} className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">Add More {step.title.replace(/s \(.*/, '')}</button>
                        </>
                    ) : (
                        renderFields(step.fields)
                    )}
                </div>
                <div className="flex justify-between items-center mt-8 gap-4">
                    <button onClick={prevStep} disabled={currentStep === 0} className="py-2 px-4 text-sm font-medium rounded-md bg-gray-200 disabled:opacity-50">Previous</button>
                    <span className={`text-sm italic ${saveStatus === 'Save failed' ? 'text-red-500' : 'text-gray-500'}`}>{saveStatus}</span>
                    {currentStep < allSteps.length - 1 ? (
                        <button onClick={nextStep} className="py-2 px-4 text-sm font-medium rounded-md text-white" style={{ backgroundColor: primaryColor }}>Next</button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={showManualResult} className="py-2 px-4 text-sm font-medium rounded-md text-white" style={{ backgroundColor: primaryColor }}>Preview & Download</button>
                            <button onClick={refineCvWithAI} disabled={isAiLoading} className="py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">{isAiLoading ? 'Refining...' : 'Refine with AI'}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CvForm;
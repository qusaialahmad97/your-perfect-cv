// src/components/cv/TemplateSelector.jsx
import React from 'react';

const TemplateSelector = ({
    templates,
    selectedTemplateId,
    onSelectTemplate,
    onNext,
    primaryColor,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setPrimaryColor,
    setDividerColor
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-7xl mx-auto border border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Choose Your CV Template</h2>
            <p className="text-gray-600 text-center mb-8">Select a template to define the visual style of your CV. You can adjust colors and fonts later.</p>

            <div className="mb-8 flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-8">
                <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">Primary Color:</label>
                    <input
                        type="color"
                        id="primaryColor"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-16 rounded-full border-2 cursor-pointer shadow-md"
                    />
                </div>
                <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-2">Font Family:</label>
                    <select
                        id="fontFamily"
                        value={templates.find(t => t.id === selectedTemplateId)?.defaultSettings?.fontFamily || 'Inter'}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Open Sans, sans-serif">Open Sans</option>
                        <option value="Lato, sans-serif">Lato</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                        <option value="Merriweather, serif">Merriweather</option>
                    </select>
                </div>
                 {/* Add more settings here if you want them controllable from this step */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {templates.map((t) => (
                    <div
                        key={t.id}
                        className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center text-center transition-all duration-200 ${
                            selectedTemplateId === t.id ? 'ring-4 scale-105' : 'border-gray-300 hover:shadow-md'
                        }`}
                        style={{
                            borderColor: selectedTemplateId === t.id ? primaryColor : undefined,
                            '--tw-ring-color': primaryColor + '30', // Add some transparency to the ring
                        }}
                        onClick={() => onSelectTemplate(t.id)}
                    >
                        <h3 className="text-xl font-semibold mb-3">{t.name}</h3>
                        {/* MODIFIED THE IMG TAG HERE */}
                        <img
                            src={t.imageUrl}
                            alt={t.name}
                            // Removed 'w-full' and 'h-48' Tailwind classes
                            className="object-cover rounded-md mb-4 shadow-sm"
                            // Added inline style for specific dimensions
                            style={{ width: '300px', height: '424px' }}
                        />
                        <button
                            className={`mt-2 py-2 px-4 rounded-md text-sm font-medium ${
                                selectedTemplateId === t.id ? 'text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                            style={{ backgroundColor: selectedTemplateId === t.id ? primaryColor : undefined }}
                        >
                            {selectedTemplateId === t.id ? 'Selected' : 'Select Template'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-end items-center mt-8 gap-4">
                <button
                    onClick={onNext}
                    className="ml-2 py-2 px-4 text-sm font-medium rounded-md text-white"
                    style={{ backgroundColor: primaryColor }}
                >
                    Next (Start Filling Data)
                </button>
            </div>
        </div>
    );
};

export default TemplateSelector;
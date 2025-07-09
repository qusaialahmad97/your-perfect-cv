// src/components/cv/ProgressBar.jsx

import React from 'react';

const ProgressBar = ({ steps, currentStep, goToStep, primaryColor }) => {
    return (
        <div className="flex justify-center items-center my-8 w-full max-w-4xl mx-auto">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div
                        className={`flex flex-col items-center relative cursor-pointer ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'} ${index === currentStep ? 'font-bold' : ''}`}
                        onClick={() => goToStep(index)}
                    >
                        <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
                            style={{ backgroundColor: index <= currentStep ? primaryColor : '' }}
                        >
                            {index + 1}
                        </div>
                        <span className="mt-2 text-xs text-center px-1">
                            {step.isTemplateSelection ? 'Template' : step.title.split(' ')[0]}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
                            style={{ backgroundColor: index < currentStep ? primaryColor : '' }}
                        ></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ProgressBar;
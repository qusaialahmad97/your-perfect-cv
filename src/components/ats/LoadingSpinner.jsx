// components/ats/LoadingSpinner.jsx
"use client";

import React from 'react';

const LoadingSpinner = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-1">This deep analysis may take up to 45 seconds...</p>
        </div>
    );
};

export default LoadingSpinner;
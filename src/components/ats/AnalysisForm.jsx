// components/ats/AnalysisForm.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';

// A small spinner icon component for the fetch button
const FetchSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const AnalysisForm = ({ onAnalysisSubmit, isProcessing }) => {
    // --- Core States ---
    const [cvFile, setCvFile] = useState(null);
    const [cvText, setCvText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [clientSideGetTextFromPdf, setClientSideGetTextFromPdf] = useState(null);
    
    // --- URL Fetching States ---
    const [inputType, setInputType] = useState('paste');
    const [jobUrl, setJobUrl] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    // --- Refined: Centralized Form Error and Success States ---
    const [formError, setFormError] = useState('');
    const [fetchSuccess, setFetchSuccess] = useState('');

    useEffect(() => {
        import('@/utils/parsePdf')
            .then(mod => setClientSideGetTextFromPdf(() => mod.getTextFromPdf))
            .catch(err => setFormError("Failed to load PDF processing capabilities."));
    }, []);

    const handleFile = useCallback(async (file) => {
        setFormError('');
        if (!file || file.type !== 'application/pdf') {
            setFormError('Please upload a valid PDF file.');
            return;
        }
        if (!clientSideGetTextFromPdf) {
            setFormError("PDF parser is not ready. Please wait a moment and try again.");
            return;
        }
        setCvFile(file);
        setIsParsing(true);
        try {
            const text = await clientSideGetTextFromPdf(file);
            setCvText(text);
        } catch (err) {
            setFormError(`Error processing PDF: ${err.message}`);
            setCvFile(null);
            setCvText('');
        } finally {
            setIsParsing(false);
        }
    }, [clientSideGetTextFromPdf]);

    const handleFileChange = (e) => { e.preventDefault(); if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); };
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
    
    const handleFetchJobDescription = async () => {
        if (!jobUrl) {
            setFormError('Please enter a LinkedIn job URL.');
            return;
        }
        setIsFetching(true);
        setFormError('');
        setFetchSuccess('');
        setJobDescription('');

        try {
            const response = await fetch('/api/scrape-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: jobUrl }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch job description.');
            }
            setJobDescription(data.jobDescription);
            setFetchSuccess('✅ Job description fetched successfully!');
            setInputType('paste');
        } catch (err) {
            setFormError(err.message);
        } finally {
            setIsFetching(false);
        }
    };
    
    const handleSubmit = () => { if (isProcessing) return; onAnalysisSubmit({ cvText, jobDescription, cvFile }); };
    const isSubmitDisabled = !cvText || !jobDescription || isProcessing;

    const handleJobDescriptionChange = (e) => {
        setJobDescription(e.target.value);
        if (fetchSuccess) setFetchSuccess('');
    }

    return (
        <>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Step 1: CV Upload */}
                <div className="bg-white p-6 rounded-xl shadow-lg border h-full flex flex-col space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">1. Upload Your CV</h2>
                    <p className="text-sm text-gray-500 -mt-2">Drag & drop or select a PDF file.</p>
                    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="h-full">
                        <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        <label htmlFor="file-upload" className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                            <div className="p-6 text-center">{isParsing ? (<p>Reading PDF...</p>) : cvFile ? (<p className="font-semibold text-green-600">✅ {cvFile.name}</p>) : (<>
                                
                                {/* ⭐⭐⭐ --- START: FIXED SVG ICON --- ⭐⭐⭐ */}
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {/* ⭐⭐⭐ --- END: FIXED SVG ICON --- ⭐⭐⭐ */}

                                <p className="mt-2 text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-400">PDF only</p></>)}
                            </div>
                        </label>
                        {dragActive && <div className="absolute w-full h-full top-0 left-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                    </form>
                    {cvText && (<div className="mt-2"><label className="text-sm font-medium text-gray-700">CV Text Preview</label><textarea readOnly value={cvText} rows="5" className="w-full mt-1 p-2 border border-gray-200 bg-gray-50 rounded-md text-xs text-gray-600 focus:ring-0 focus:border-gray-200"/></div>)}
                </div>

                {/* Step 2: Job Description */}
                <div className={`bg-white p-6 rounded-xl shadow-lg border h-full flex flex-col transition-opacity duration-500 ${!cvText ? 'opacity-50' : 'opacity-100'}`}>
                    <h2 className="text-2xl font-bold text-gray-800">2. Add Job Description</h2>
                    <div className="flex items-center rounded-md bg-gray-100 p-1 my-4">
                        <button onClick={() => { setInputType('paste'); setFetchSuccess(''); }} disabled={!cvText} className={`w-1/2 rounded-md py-2 text-sm font-medium transition ${inputType === 'paste' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Paste Text</button>
                        <button onClick={() => setInputType('url')} disabled={!cvText} className={`w-1/2 rounded-md py-2 text-sm font-medium transition ${inputType === 'url' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>From LinkedIn URL</button>
                    </div>

                    {fetchSuccess && <p className="mb-3 text-sm font-semibold text-green-600">{fetchSuccess}</p>}

                    {inputType === 'paste' ? (
                        <textarea
                            value={jobDescription}
                            onChange={handleJobDescriptionChange}
                            rows="10"
                            placeholder={!cvText ? "Upload your CV first..." : "Paste the full job description here..."}
                            disabled={!cvText}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 flex-grow disabled:bg-gray-100"
                        />
                    ) : (
                        <div className="flex flex-col space-y-3">
                            <input
                                type="url"
                                value={jobUrl}
                                onChange={(e) => { setJobUrl(e.target.value); setFormError(''); }}
                                placeholder="https://www.linkedin.com/jobs/view/..."
                                disabled={!cvText}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            <button 
                                onClick={handleFetchJobDescription} 
                                disabled={!cvText || isFetching} 
                                className="flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isFetching ? <><FetchSpinner /> Fetching...</> : 'Fetch Job Description'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {formError && <div className="mt-6 max-w-2xl mx-auto bg-red-100 text-red-700 p-3 rounded-md text-center" role="alert">{formError}</div>}
            
            <div className="mt-8 text-center">
                <button onClick={handleSubmit} disabled={isSubmitDisabled} className="bg-green-600 text-white font-bold py-3 px-12 text-lg rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                    {isProcessing ? 'Analyzing...' : 'Get My Score'}
                </button>
            </div>
        </>
    );
};
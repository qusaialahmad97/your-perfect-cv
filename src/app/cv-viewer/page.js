// src/app/cv-viewer/page.js
"use client"; // This component correctly marks itself as a Client Component

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
// FIX: Corrected import path for AuthContext
import { useAuth } from '@/contexts/AuthContext'; // <--- CHANGED THIS LINE
import PrintableCv from '@/components/cv/PrintableCv';
import Link from 'next/link';

// Placeholder for loading state while the main component loads
const CvViewerLoading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-lg text-gray-700">Loading CV...</p>
  </div>
);

const CvViewerPageContent = () => {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [cvData, setCvData] = useState(null);
  const [cvName, setCvName] = useState("Loading CV...");
  const [errorMessage, setErrorMessage] = useState('');
  const componentToPrintRef = useRef(null);

  const getInitialCvData = () => ({
    personalInformation: { name: '', email: '', phone: '', linkedin: '', city: '', country: '', portfolioLink: '', contact: '' },
    summary: '', 
    experience: [], 
    education: [], 
    projects: [],
    skills: { technical: '', soft: '', languages: '' },
    references: [],
    awards: [],
    courses: [],
    certifications: [],
    customSections: [],
    settings: {
        primaryColor: '#2563EB',
        dividerColor: '#e0e0e0',
        fontSize: '11pt',
        lineHeight: '1.4'
    },
    aiHelpers: {
        targetRole: '', 
        jobDescription: '', 
        referencesRaw: '',
        awardsRaw: '',
        coursesRaw: '',
        certificationsRaw: '',
        customSectionsRaw: ''
    },
  });

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setErrorMessage("Please log in to view CVs.");
      return;
    }

    const cvIdFromUrl = searchParams.get('cvId');
    if (!cvIdFromUrl) {
      setErrorMessage("No CV ID provided in URL.");
      return;
    }

    const loadCv = async () => {
      try {
        const userDocRef = doc(db, 'users', String(user.id));
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const allCvs = userDocSnap.data().cvs || [];
          const specificCv = allCvs.find(cv => cv.id === cvIdFromUrl);
          if (specificCv) {
            setCvName(specificCv.name);
            setCvData({ ...getInitialCvData(), ...specificCv.cvData }); // Merge with initial to ensure all keys exist
          } else {
            setErrorMessage("CV not found.");
          }
        } else {
          setErrorMessage("User profile not found.");
        }
      } catch (error) {
        console.error("Failed to load CV:", error);
        setErrorMessage("Failed to load CV due to an error.");
      }
    };
    loadCv();
  }, [user, loading, searchParams]); // searchParams is now a valid dependency here because it's wrapped in Suspense

  // Determine primary color from cvData or fallback
  const primaryColor = cvData?.settings?.primaryColor || '#2563EB';

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700 mb-8">{errorMessage}</p>
        <Link href="/dashboard" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (!cvData) {
    return <CvViewerLoading />; // Show a loading spinner while data is fetched
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">{cvName}</h1>
        <div className="flex items-center gap-4">
          <Link 
            href={`/build?cvId=${searchParams.get('cvId')}`}
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition whitespace-nowrap"
          >
            Edit CV
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition whitespace-nowrap"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        {cvData ? (
          <PrintableCv 
            ref={componentToPrintRef} // This ref is for printing, not direct rendering in the browser
            data={cvData} 
            primaryColor={primaryColor} 
            settings={cvData.settings} 
          />
        ) : (
          <CvViewerLoading />
        )}
      </main>
    </div>
  );
};

// This is the actual Page component, which wraps the content in Suspense
export default function CvViewerPage() {
  return (
    <Suspense fallback={<CvViewerLoading />}>
      <CvViewerPageContent />
    </Suspense>
  );
}
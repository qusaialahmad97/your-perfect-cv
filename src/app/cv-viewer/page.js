"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PrintableCv from '@/components/cv/PrintableCv';
import { useReactToPrint } from 'react-to-print';

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>;

export default function CvViewerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [cvData, setCvData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Corrected from previous response
    documentTitle: cvData ? `${cvData.name?.replace(/\s/g, '_') || 'My_CV'}` : 'My_CV',
    onPrintError: (error) => console.error("Error printing:", error),
    pageStyle: `
      @page {
        size: A4;
        margin: 1cm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const cvId = searchParams.get('cvId');
    if (!cvId) {
      setError("No CV ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchCvData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const allCvs = userDocSnap.data().cvs || [];
          const specificCv = allCvs.find(cv => cv.id === cvId);
          if (specificCv) {
            setCvData(specificCv); // full cv object including .cvData
          } else {
            setError("CV not found.");
          }
        } else {
          setError("User profile not found.");
        }
      } catch (err) {
        console.error("Error fetching CV data:", err);
        setError("Failed to load CV data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCvData();
  }, [user, loading, router, searchParams]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <p className="text-gray-500 text-xl mb-4">Could not display the CV.</p>
        <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Determine primaryColor and settings from fetched cvData
  const primaryColor = cvData.cvData?.settings?.primaryColor || "#2563EB";
  const settings = cvData.cvData?.settings || {};

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handlePrint}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600"
          >
            Download as PDF
          </button>
        </div>
        
        {/* Render PrintableCv offscreen for printing */}
        <div style={{ position: 'fixed', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
          {cvData.cvData && (
            <PrintableCv 
              ref={componentRef} 
              data={cvData.cvData} 
              primaryColor={primaryColor} // Pass derived primaryColor
              settings={settings} // Pass settings object
            />
          )}
        </div>
        
        {/* Also optionally display the CV normally on page */}
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden p-6">
          {cvData.cvData && (
            <PrintableCv 
              data={cvData.cvData} 
              primaryColor={primaryColor} // Pass derived primaryColor
              settings={settings} // Pass settings object
            />
          )}
        </div>
      </div>
    </div>
  );
}
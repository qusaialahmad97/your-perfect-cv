"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Spinner = () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cvs, setCvs] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      return; // Wait until auth state is determined
    }
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchCvs = async () => {
      try {
        const userDocRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().cvs) {
          // Sort CVs by most recently updated
          const sortedCvs = docSnap.data().cvs.sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setCvs(sortedCvs);
        }
      } catch (err) {
        console.error("Failed to fetch CVs:", err);
        setError("Could not load your CVs. Please try again later.");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchCvs();
  }, [user, loading, router]);

  const handleDelete = async (cvIdToDelete) => {
    if (!user || !window.confirm("Are you sure you want to delete this CV? This action cannot be undone.")) {
      return;
    }

    try {
      const updatedCvs = cvs.filter(cv => cv.id !== cvIdToDelete);
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, { cvs: updatedCvs });
      setCvs(updatedCvs); // Update state locally to reflect change immediately
    } catch (err) {
      console.error("Failed to delete CV:", err);
      setError("Failed to delete CV. Please try again.");
    }
  };

  if (isPageLoading || loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        <Link href="/build?cvId=new" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition">
          + Create New CV
        </Link>
      </div>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {cvs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map(cv => (
            <div key={cv.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 truncate">{cv.name || 'Untitled CV'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(cv.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                {/* 
                  =======================================================
                  === THE FIX IS HERE: The href points to /cv-viewer ===
                  =======================================================
                */}
                <Link 
                  href={`/cv-viewer?cvId=${cv.id}`} 
                  className="flex-1 text-center bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition"
                >
                  View
                </Link>
                <button 
                  onClick={() => router.push(`/build?cvId=${cv.id}`)} 
                  className="flex-1 text-center bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(cv.id)}
                  className="bg-red-100 text-red-700 p-2 rounded-md hover:bg-red-200 transition"
                  aria-label="Delete CV"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-700">No CVs Found</h2>
          <p className="text-gray-500 mt-2">Get started by creating your first professional CV.</p>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ATSResult from '@/components/ats/ATSResult'; // We reuse the result component here!

const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Fetching Scan History...</p>
    </div>
);

const ScoreBadge = ({ score }) => {
    const getScoreColor = (s) => (s >= 85 ? 'bg-green-100 text-green-800' : s >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800');
    return <span className={`font-bold text-lg px-2 py-1 rounded-md ${getScoreColor(score)}`}>{score}%</span>;
};


const AtsHistoryPage = () => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedScan, setSelectedScan] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchScans = async () => {
            // --- THE FIX ---
            // We explicitly check for user AND user.uid before proceeding.
            // This prevents the race condition where `user` exists but `user.uid` is not yet available.
            if (!user || !user.uid) {
                setLoading(false); // Stop loading if there's no user ID
                return;
            };
            // --- END OF FIX ---

            setLoading(true);
            try {
                const scansCollectionRef = collection(db, 'users', user.uid, 'atsScans');
                const q = query(scansCollectionRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedScans = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setScans(fetchedScans);
            } catch (err) {
                console.error("Error fetching scan history:", err);
                setError("Could not fetch your scan history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, [user, authLoading, isAuthenticated, router]);
    
    const handleBackToHistory = () => {
        setSelectedScan(null);
    };

    if (loading || authLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    if (selectedScan) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <button onClick={handleBackToHistory} className="font-semibold text-blue-600 hover:text-blue-800 transition">
                        ← Back to Scan History
                    </button>
                </div>
                {/* When used here, onReset goes back to the list view */}
                <ATSResult result={selectedScan.fullResult} onReset={handleBackToHistory} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-800">ATS Scan History</h1>
                <p className="mt-2 text-lg text-gray-600">Review your past analyses to track your progress.</p>
            </div>

            {scans.length === 0 ? (
                <div className="text-center bg-white p-10 rounded-lg shadow-md border">
                    <h3 className="text-xl font-semibold text-gray-700">No Scans Found</h3>
                    <p className="text-gray-500 mt-2 mb-6">You haven't analyzed any CVs yet. Let's get started!</p>
                    <button onClick={() => router.push('/dashboard/ats-checker')} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition">
                        Scan Your First CV
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {scans.map(scan => (
                        <div
                            key={scan.id}
                            onClick={() => setSelectedScan(scan)}
                            className="bg-white p-4 rounded-lg shadow border flex justify-between items-center cursor-pointer hover:shadow-lg hover:border-blue-500 transition"
                        >
                            <div className="flex-grow">
                                <p className="font-bold text-gray-800 truncate">{scan.jobTitleSnippet}</p>
                                <p className="text-sm text-gray-500">
                                    {scan.cvFileName} • {scan.createdAt ? new Date(scan.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className="ml-4">
                                <ScoreBadge score={scan.overallScore} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsHistoryPage;
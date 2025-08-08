// File: app/build/page.tsx
import { Suspense } from 'react';
import CvBuilderClient from './CvBuilderClient'; // Import the client component

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
);

// This is the Server Component that provides the Suspense boundary
export default function BuildPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <CvBuilderClient />
        </Suspense>
    );
}
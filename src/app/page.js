// src/app/page.js

import React from 'react';
import Link from 'next/link'; // Make sure this is imported from 'next/link'

// A simple SVG icon component for the features section
const FeatureIcon = ({ children }) => (
  <div className="bg-blue-100 text-blue-600 rounded-full h-12 w-12 flex items-center justify-center mb-4">
    {children}
  </div>
);

const HomePage = () => {
  return (
    <div className="bg-white text-gray-800">
      {/* --- Hero Section --- */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          Craft Your Perfect CV with the Power of <span className="text-blue-600">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Stop struggling with formatting and wording. Our AI-driven builder helps you create a professional, ATS-friendly resume in minutes, tailored to land your dream job.
        </p>
        {/* --- FIX IS HERE --- */}
        <Link 
          href="/registration" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
        >
          Get Started for Free
        </Link>
      </section>

      {/* --- Features Section --- */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Why Choose AI CV Crafter?</h2>
            <p className="text-gray-600 mt-2">Everything you need to build a resume that stands out.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <FeatureIcon>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </FeatureIcon>
              <h3 className="text-xl font-semibold mb-2">Intelligent Suggestions</h3>
              <p className="text-gray-600">
                Get AI-powered suggestions for your summary, responsibilities, and achievements to make them more impactful.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <FeatureIcon>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </FeatureIcon>
              <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
              <p className="text-gray-600">
                Choose from a variety of professionally designed and ATS-friendly templates to match your industry and style.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <FeatureIcon>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </FeatureIcon>
              <h3 className="text-xl font-semibold mb-2">Easy PDF Download</h3>
              <p className="text-gray-600">
                Export your finished CV as a high-quality, pixel-perfect PDF, ready to be sent to recruiters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Call to Action Section --- */}
      <section className="text-center py-20 px-4">
        <h2 className="text-4xl font-bold mb-4">Ready to Land Your Next Job?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Join thousands of professionals who have built their success stories with a standout CV.
        </p>
        {/* --- FIX IS HERE --- */}
        <Link 
          href="/registration" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
        >
          Create My CV Now
        </Link>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-gray-800 text-white p-6">
        <div className="container mx-auto text-center">
            <p>© {new Date().getFullYear()} AI CV Crafter. All Rights Reserved.</p>
            <div className="mt-2 space-x-4 text-sm">
                {/* --- FIX IS HERE --- */}
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white">
                    Terms of Service
                </Link>
                <span>|</span>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white">
                    Privacy Policy
                </Link>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
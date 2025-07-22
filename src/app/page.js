'use client';

import React from 'react';
import Link from 'next/link';

const FeatureIcon = ({ children }) => (
  <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md">
    {children}
  </div>
);

const HomePage = () => {
  return (
    <div className="bg-white text-gray-800 w-full overflow-x-hidden">
      {/* --- Hero Section --- */}
      <section className="w-full bg-gradient-to-br from-blue-100 to-white py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-green-300 opacity-20 rounded-full blur-3xl animate-pulse"></div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 z-10 relative">
          Craft a <span className="text-blue-600">Winning CV</span> <br />with AI Superpowers
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-10 z-10 relative">
          Create beautifully designed, recruiter-optimized resumes with real-time suggestions and powerful design tools.
        </p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-110 shadow-xl z-10 relative"
        >
          Get Started For Free
        </Link>
      </section>

      {/* --- Features Section --- */}
      <section className="w-full bg-white py-28 px-6">
        <div className="w-full max-w-screen-2xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Features That Empower You</h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
              We go beyond basic resume builders with smart, customizable tools designed to get you hired faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
            {[
              {
                title: 'AI-Powered Wording',
                description: 'Auto-generate impactful summaries and job bullet points tailored to your experience.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                title: 'Live Preview Editor',
                description: 'See changes to your resume in real time and switch layouts with a single click.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276a1 1 0 010 1.789L15 16m-6-6l-4.553 2.276a1 1 0 000 1.789L9 16m3 0v4m0-4l-3-2m3 2l3-2" />
                  </svg>
                )
              },
              {
                title: 'ATS Optimization',
                description: 'Built-in scanner helps you ensure your resume is readable by applicant tracking systems.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              },
              {
                title: 'Multi-language Support',
                description: 'Create your resume in English, Arabic, French and more — we support localization.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )
              }
            ].map(({ title, description, icon }, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <FeatureIcon>{icon}</FeatureIcon>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section className="w-full bg-blue-50 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Loved by Job Seekers Worldwide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: 'Sarah M.',
                text: 'This tool helped me land interviews at 3 top companies in just two weeks!'
              },
              {
                name: 'James K.',
                text: 'I never thought writing a CV could be this easy. The AI suggestions are genius!'
              },
              {
                name: 'Layla A.',
                text: 'Built a stunning CV in 10 minutes. Even my friends asked which tool I used.'
              }
            ].map(({ name, text }, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-md text-gray-700">
                <p className="italic mb-4">"{text}"</p>
                <h4 className="font-semibold text-sm">— {name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Call to Action --- */}
      <section className="w-full bg-green-500 py-20 px-6 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Take the Next Step in Your Career</h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Start building a powerful CV in minutes. It’s free, it’s smart, and it’s built for you.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-10 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-md"
        >
          Start Building Now
        </Link>
      </section>

      {/* --- Footer --- */}
      <footer className="w-full bg-gray-900 text-white py-10 px-6">
        <div className="w-full max-w-screen-xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-4">
            &copy; {new Date().getFullYear()} AI CV Crafter. All rights reserved.
          </p>
          <div className="space-x-4 text-sm">
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <span>|</span>
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
'use client';

import React from 'react';
import Link from 'next/link';

// A more visually engaging icon component
const FeatureIcon = ({ icon: Icon, color }) => (
  <div className={`relative z-10 bg-white rounded-xl h-20 w-20 flex items-center justify-center mb-6 shadow-lg border border-gray-100`}>
    <div className={`absolute -inset-1 bg-gradient-to-br from-${color}-200 to-white rounded-lg blur opacity-50`}></div>
    <Icon className={`h-9 w-9 text-${color}-600 z-20`} />
  </div>
);

// A new testimonial card component for a richer look
const TestimonialCard = ({ name, role, text, avatar }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
    <div className="flex items-center mb-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4 object-cover" />
      <div>
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
    <p className="text-gray-600 italic">"{text}"</p>
  </div>
);


const HomePage = () => {
  return (
    <div className="bg-white text-gray-800 w-full overflow-x-hidden">
      {/* --- Hero Section --- */}
      <section className="relative w-full bg-gray-50 py-32 px-6 text-center">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            Land Your Dream Job Faster with a <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
              Perfect, AI-Crafted CV
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            Stop guessing what recruiters want. Our AI analyzes your experience and crafts a stunning, ATS-friendly resume that gets you noticed.
          </p>
          <div className="flex justify-center items-center gap-4">
            <Link
              href="/register"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Create My CV Now
            </Link>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            Join 50,000+ professionals who trust us ✨ Free to start, no credit card required.
          </div>
        </div>
      </section>
      
      {/* --- How It Works Section (NEW) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-6xl text-center px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Perfect CV in 3 Simple Steps</h2>
          <p className="text-lg text-gray-600 mb-16">From blank page to job-ready in minutes.</p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 mb-6 bg-blue-100 text-blue-600 rounded-full text-3xl font-bold">1</div>
              <h3 className="text-2xl font-semibold mb-2">Choose a Template</h3>
              <p className="text-gray-600">Select from our library of professionally designed, recruiter-approved templates.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 mb-6 bg-blue-100 text-blue-600 rounded-full text-3xl font-bold">2</div>
              <h3 className="text-2xl font-semibold mb-2">Let AI Do the Work</h3>
              <p className="text-gray-600">Our smart AI generates powerful bullet points and summaries based on your job title.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 mb-6 bg-blue-100 text-blue-600 rounded-full text-3xl font-bold">3</div>
              <h3 className="text-2xl font-semibold mb-2">Download & Apply</h3>
              <p className="text-gray-600">Export your new CV as a PDF and start applying for jobs with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Section (REVAMPED) --- */}
      <section className="w-full bg-gray-50 py-28 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4">The Smartest Way to Build a CV</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tools designed to give you an unfair advantage in your job search.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
              {
                title: 'Write Like a Pro, Instantly',
                description: 'Beat writer\'s block with AI that suggests impactful phrasing and keywords for your specific role.',
                icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.543l.227 1.581a4.5 4.5 0 002.456 2.456l1.58.227a4.5 4.5 0 002.456-2.456l.227-1.581a4.5 4.5 0 00-2.456-2.456l-1.58-.227a4.5 4.5 0 00-2.456 2.456z" /></svg>,
                color: 'blue'
              },
              {
                title: 'Beat the Robots (ATS)',
                description: 'Our templates are optimized to pass through Applicant Tracking Systems that filter 80% of resumes.',
                icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                color: 'green'
              },
              {
                title: 'Design With Confidence',
                description: 'Switch templates, colors, and fonts in one click. See your changes live as you type.',
                icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251-.047.502-.094.752-.141a2.25 2.25 0 012.134 2.318A12 12 0 0113.5 21 2.25 2.25 0 0111.25 18.75v-5.714a2.25 2.25 0 01.659-1.591L15.5 6.5m-5.75 0C9.43 6.353 9.214 6.236 9 6.132c-.214-.104-.43-.222-.659-.341a2.25 2.25 0 00-2.134 2.318 12 12 0 003.868 13.43 2.25 2.25 0 002.134-2.318v-5.714a2.25 2.25 0 00-.659-1.591L9.75 6.5z" /></svg>,
                color: 'purple'
              },
              {
                title: 'Go Global',
                description: 'Effortlessly create your resume in English, Arabic, French, and more. Localization is built-in.',
                icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>,
                color: 'red'
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-start text-left">
                <FeatureIcon icon={feature.icon} color={feature.color} />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials Section (REVAMPED) --- */}
      <section className="w-full bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Don't Just Take Our Word For It</h2>
          <p className="text-lg text-gray-600 mb-16">See how job seekers like you have transformed their careers.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard name="Sarah Chen" role="Marketing Director" text="The AI writer is a game-changer. It helped me quantify my achievements in a way I never could on my own. I landed 3 interviews within a week." avatar="https://randomuser.me/api/portraits/women/34.jpg" />
            <TestimonialCard name="David Lee" role="Software Engineer" text="As a developer, design isn't my strong suit. This tool made it incredibly easy to create a professional, modern CV that got me noticed by FAANG recruiters." avatar="https://randomuser.me/api/portraits/men/46.jpg" />
            <TestimonialCard name="Aisha Ahmed" role="Project Manager" text="I was struggling to pass the initial screening. The ATS optimization feature made all the difference. Finally, I'm getting calls back!" avatar="https://randomuser.me/api/portraits/women/44.jpg" />
          </div>
        </div>
      </section>

      {/* --- Final Call to Action (REVAMPED) --- */}
      <section className="w-full bg-blue-600 py-24 px-6 text-center text-white">
        <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl font-extrabold mb-6">Ready to Land Your Dream Job?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-10">
                Your next career move is just a few clicks away. Stop waiting and start building the CV that opens doors.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-700 hover:bg-gray-100 font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Start Building For Free
            </Link>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="w-full bg-gray-900 text-white py-10 px-6">
        <div className="w-full max-w-screen-xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-4">
            &copy; {new Date().getFullYear()} Your Perfect CV. All rights reserved.
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
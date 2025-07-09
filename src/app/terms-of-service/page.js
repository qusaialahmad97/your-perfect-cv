// src/pages/TermsOfServicePage.jsx
import React from 'react';

const TermsOfServicePage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="prose lg:prose-xl">
        <h1 className="text-4xl font-extrabold text-gray-800">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-6" role="alert">
          <p className="font-bold">Disclaimer</p>
          <p>This is a template and not a legally binding contract until reviewed and adapted by a legal professional. You must customize this to fit your specific business model and legal requirements.</p>
        </div>

        <h2>1. Agreement to Terms</h2>
        <p>
          By creating an account or using the Your Perfect CV website and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Your Perfect CV provides users with tools to create, edit, and manage curriculum vitae ("CVs"). This includes a manual builder, AI-powered generation tools, and an ATS (Applicant Tracking System) checker. Features may be available for free or as part of a paid subscription ("Pro Subscription").
        </p>

        <h2>3. User Accounts and Responsibilities</h2>
        <p>
          You must be at least 18 years old to use the Service. You are responsible for safeguarding your account password and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to keep this information up to date. You may not use the Service for any illegal or unauthorized purpose.
        </p>
        
        <h2>4. User Content</h2>
        <p>
          You retain full ownership of the content you create and input into the Service, including all text and documents for your CVs ("User Content"). By using the Service, you grant us a limited, worldwide, non-exclusive license to host, process, and use your User Content solely for the purpose of providing the Service to you. You are solely responsible for your User Content and assume all risks associated with it.
        </p>

        <h2>5. Prohibited Activities</h2>
        <p>You agree not to engage in any of the following prohibited activities:</p>
        <ul>
          <li>Using the service to create content that is fraudulent, defamatory, or obscene.</li>
          <li>Attempting to probe, scan, or test the vulnerability of any system or network.</li>
          <li>Interfering with or disrupting the integrity or performance of the Service.</li>
          <li>Using any automated system to access the Service in a manner that sends more request messages to the servers than a human can reasonably produce in the same period by using a conventional on-line web browser.</li>
        </ul>

        <h2>6. Payments and Subscriptions</h2>
        <p>
          Certain features of the Service may be subject to payments now or in the future. All payments are handled by our third-party payment processor, Paddle. By making a purchase, you agree to their terms and conditions. Subscriptions will automatically renew unless canceled. You can manage or cancel your subscription through your account settings or by contacting our support.
        </p>
        
        <h2>7. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
        </p>
        
        <h2>8. Limitation of Liability</h2>
        <p>
          In no event shall Your Perfect CV, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice before any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at: [Your Contact Email Address]
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
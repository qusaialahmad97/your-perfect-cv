import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 bg-white">
      <div className="prose lg:prose-xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: July 22, 2025</p>

        <h2 className="mt-10 mb-4 font-bold">1. Introduction</h2>
        <p className="mb-4">
          Welcome to Your Perfect CV ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, www.yourperfectcv.com, and our services (the "Services"). Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>
        <p className="mb-4">
          As Your Perfect CV operates globally, we strive to comply with applicable data protection laws wherever our users are located.
        </p>

        <h2 className="mt-10 mb-4 font-bold">2. Information We Collect</h2>
        <p className="mb-4">
          We may collect information about you in a variety of ways. The information we may collect on the Site includes:
        </p>
        <h3 className="mt-6 mb-3 font-semibold">Personal Data</h3>
        <p className="mb-4">
          Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register for an account. You are under no obligation to provide us with personal information of any kind; however, your refusal to do so may prevent you from using certain features of the Site.
        </p>
        <h3 className="mt-6 mb-3 font-semibold">CV Data</h3>
        <p className="mb-4">
          All information you voluntarily enter into our CV builder or AI-powered tools. This includes, but is not limited to, your employment history, educational background, skills, contact information, and any text or files you upload for analysis (like in the ATS Checker). We treat this data as highly sensitive.
        </p>
        <h3 className="mt-6 mb-3 font-semibold">Financial Data</h3>
        <p className="mb-4">
          We do not directly collect or store financial information. All financial information is provided directly to our third-party payment processor, **Paddle**. As our Merchant of Record, Paddle is responsible for handling all payments and associated financial data. We encourage you to review their privacy policy **<a href="https://www.paddle.com/legal/privacy" className="text-blue-600 hover:underline">here</a>** and contact them directly for responses to your questions.
        </p>
        <h3 className="mt-6 mb-3 font-semibold">Derivative Data</h3>
        <p className="mb-4">
          Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site.
        </p>
        
        <h2 className="mt-10 mb-4 font-bold">3. How We Use Your Information</h2>
        <p className="mb-4">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
        </p>
        <ul className="mb-4">
            <li>Create and manage your account.</li>
            <li>Provide and deliver the Services you request, process transactions, and send you related information, including confirmations and invoices.</li>
            <li>Use the data you provide to our AI tools to generate CVs, check against job descriptions, and provide suggestions as part of the Service.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site and our Services.</li>
            <li>Respond to your comments, questions, and provide customer service.</li>
        </ul>

        <h2 className="mt-10 mb-4 font-bold">4. Disclosure of Your Information</h2>
        <p className="mb-4">
          We do not share, sell, rent, or trade your Personal Data or CV Data with third parties for their commercial purposes.
        </p>
        <p className="mb-4">
          We may share information we have collected about you in certain situations:
        </p>
        <ul className="mb-4">
            <li><strong>With Your Consent:</strong> We may share your information with third parties when you have given us your express consent to do so.</li>
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (**Paddle**), data analysis, hosting services (e.g., Vercel/Netlify, Firebase), and AI processing (Google AI). These service providers will have access to your information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
        </ul>

        <h2 className="mt-10 mb-4 font-bold">5. Data Security</h2>
        <p className="mb-4">
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>

        <h2 className="mt-10 mb-4 font-bold">6. Changes to This Privacy Policy</h2>
        <p className="mb-4">
            We may update this Privacy Policy from time to time. The updated version will be indicated by a "Last updated" date and the updated version will be effective as soon as it is accessible. If we make material changes to this Privacy Policy, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.
        </p>
        
        <h2 className="mt-10 mb-4 font-bold">7. Contact Us</h2>
        <p className="mb-4">
          If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:support@yourperfectcv.com" className="text-blue-600 hover:underline">support@yourperfectcv.com</a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
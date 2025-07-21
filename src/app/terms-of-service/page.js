import React from 'react';

const TermsOfServicePage = () => {
  return (
    // The top-level padding has been increased slightly for better framing
    <div className="max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 bg-white">
      <div className="prose lg:prose-xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: July 21, 2025</p>

        <p className="mb-6">
          By accessing or using the Your Perfect CV website and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
        </p>
        
        {/* --- STYLE CHANGE: Added margin-top (mt) and margin-bottom (mb) to headings and paragraphs --- */}
        
        <h2 className="mt-10 mb-4 font-bold">1. Agreement to Terms</h2>
        <p className="mb-4">
          These Terms constitute a legally binding agreement between you and Your Perfect CV ("Company," "we," "us," or "our") concerning your access to and use of the Your Perfect CV website (www.yourperfectcv.com) and any associated services, features, content, or applications (collectively, the "Service"). You agree that by accessing the Service, you have read, understood, and agreed to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Service and you must discontinue use immediately.
        </p>
        <p className="mb-4">
          Supplemental terms and conditions or documents that may be posted on the Service from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Service at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Terms of Service, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Terms of Service to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Terms of Service by your continued use of the Service after the date such revised Terms of Service are posted.
        </p>
        <p className="mb-4">
          The information provided on the Service is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Service from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
        </p>

        <h2 className="mt-10 mb-4 font-bold">2. Description of Service</h2>
        <p className="mb-4">
          Your Perfect CV provides users with online tools and resources to create, edit, and manage curriculum vitae ("CVs") and other career-related documents. This includes, but is not limited to, a manual CV builder, AI-powered content generation tools, and an ATS (Applicant Tracking System) compatibility checker. Features and functionalities of the Service may be offered on a free basis or as part of a paid subscription ("Pro Subscription"), as detailed on the Service's pricing pages. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.
        </p>

        <h2 className="mt-10 mb-4 font-bold">3. User Accounts and Responsibilities</h2>
        <p className="mb-4">
          To access certain features of the Service, you may be required to register for an account. You must be at least 18 years old (or the age of majority in your jurisdiction, whichever is higher) to create an account and use the Service. By registering, you represent and warrant that you meet this age requirement.
        </p>
        <p className="mb-4">
          You are solely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to provide accurate, current, and complete information during the registration process and to promptly update your account information to keep it accurate, current, and complete. We cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
        </p>
        <p className="mb-4">
          You agree not to register for an account on behalf of an individual other than yourself, or register for an account on behalf of any group or entity unless you are authorized to do so.
        </p>
        <p className="mb-4">
          You agree that you will not use the Service for any illegal or unauthorized purpose, nor will you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
        </p>

        <h2 className="mt-10 mb-4 font-bold">4. User Content</h2>
        <p className="mb-4">
          You retain full ownership of all content, data, text, documents, images, and other materials that you create, upload, input, or submit to the Service for the purpose of creating your CVs ("User Content").
        </p>
        <p className="mb-4">
          By using the Service, you grant Your Perfect CV a limited, worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to host, store, process, reproduce, modify, adapt, publish, translate, distribute, and display your User Content solely for the purpose of providing, maintaining, and improving the Service to you. This license also extends to allowing us to use User Content in an aggregated and anonymized form for statistical analysis, product improvement, and marketing purposes, provided that such use does not identify you personally.
        </p>
        <p className="mb-4">
          You are solely responsible for your User Content and assume all risks associated with it, including any reliance on its accuracy, completeness, or usefulness by others, or any disclosure by you of information in your User Content that makes you personally identifiable. You represent and warrant that:
        </p>
        <ul className="mb-4">
          <li>You own or have the necessary licenses, rights, consents, and permissions to use and authorize us to use your User Content as described herein.</li>
          <li>Your User Content does not violate any law, infringe upon the rights of any third party (including intellectual property, privacy, or publicity rights), or contain any defamatory, obscene, or otherwise unlawful material.</li>
        </ul>
        <p className="mb-4">
          We reserve the right, but are not obligated, to remove or disable access to any User Content that we, in our sole discretion, consider to be in violation of these Terms or harmful to the Service.
        </p>

        <h2 className="mt-10 mb-4 font-bold">5. Prohibited Activities</h2>
        <p className="mb-4">You agree not to engage in any of the following prohibited activities:</p>
        <ul className="mb-4">
          <li>Using the Service to create, upload, or transmit any content that is fraudulent, deceptive, misleading, unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
          <li>Attempting to gain unauthorized access to any portion or feature of the Service, or any other systems or networks connected to the Service or to any Your Perfect CV server, or to any of the services offered on or through the Service, by hacking, password "mining," or any other illegitimate means.</li>
          <li>Probing, scanning, or testing the vulnerability of the Service or any network connected to the Service, nor breaching the security or authentication measures on the Service or any network connected to the Service.</li>
          <li>Interfering with or disrupting the integrity or performance of the Service or data contained therein, or attempting to decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Service.</li>
          <li>Using any automated system, including without limitation "robots," "spiders," "offline readers," etc., to access the Service in a manner that sends more request messages to Your Perfect CV servers than a human can reasonably produce in the same period by using a conventional on-line web browser.</li>
          <li>Impersonating any person or entity, or falsely stating or otherwise misrepresenting your affiliation with a person or entity.</li>
          <li>Collecting or storing personal data about other users without their express consent.</li>
          <li>Using the Service for any commercial endeavors, unless explicitly agreed upon in a separate written agreement with Your Perfect CV.</li>
        </ul>

        <h2 className="mt-10 mb-4 font-bold">6. Payments and Subscriptions</h2>
        <p className="mb-4">
          Certain features of the Service, including "Pro Subscription" benefits, may be subject to payments. All payments are processed through our third-party payment processor, Paddle. By making a purchase through the Service, you agree to be bound by the terms and conditions of Paddle.
        </p>
        <p className="mb-4">Subscription Details:</p>
        <ul className="mb-4">
          <li><strong>Automatic Renewal:</strong> Unless otherwise stated, subscriptions will automatically renew at the end of each billing period (e.g., monthly, annually) at the then-current subscription rate.</li>
          <li><strong>Cancellation:</strong> You can manage or cancel your subscription at any time through your account settings on the Your Perfect CV website. Instructions for cancellation will be provided in your account dashboard. You may also contact our support team at support@yourperfectcv.com for assistance with cancellation. Cancellation will take effect at the end of your current billing period, and you will retain access to Pro features until that time.</li>
          <li><strong>Refunds:</strong> All payments are non-refundable.</li>
        </ul>
        <p className="mb-4">
          We reserve the right to change our pricing and subscription plans at any time, but such changes will not affect the price of your current, active subscription period.
        </p>

        <h2 className="mt-10 mb-4 font-bold">7. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of these Terms.
        </p>
        <p className="mb-4">
          Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
        </p>
        <p className="mb-4">
          All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
        </p>

        <h2 className="mt-10 mb-4 font-bold">8. Limitation of Liability</h2>
        <p className="mb-4">
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL YOUR PERFECT CV, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
        </p>


        <h2 className="mt-10 mb-4 font-bold">9. Indemnification</h2>
        <p className="mb-4">
          You agree to defend, indemnify, and hold harmless Your Perfect CV and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms; or c) your User Content.
        </p>

        <h2 className="mt-10 mb-4 font-bold">10. Governing Law and Dispute Resolution</h2>
        <p className="mb-4">
          These Terms shall be governed and construed in accordance with the laws of Jordan, without regard to its conflict of law provisions.
        </p>
        <p className="mb-4">
          Any dispute arising from or relating to the subject matter of these Terms shall be finally settled by arbitration in Amman, Jordan. The prevailing party in any arbitration or other legal action shall be entitled to recover its reasonable attorneys' fees and costs.
        </p>


        <h2 className="mt-10 mb-4 font-bold">11. Severability</h2>
        <p className="mb-4">
          If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have had between us regarding the Service.
        </p>

        <h2 className="mt-10 mb-4 font-bold">12. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
        <p className="mb-4">
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
        </p>

        <h2 className="mt-10 mb-4 font-bold">13. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us:
        </p>
        <p className="mb-4">
          By email: <a href="mailto:support@yourperfectcv.com" className="text-blue-600 hover:underline">support@yourperfectcv.com</a>
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
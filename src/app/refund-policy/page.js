import React from 'react';

const RefundPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 bg-white">
      <div className="prose lg:prose-xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: October 22, 2025</p>

        {/* --- Section 1: Clarify the relationship with Paddle --- */}
        <p className="mb-6">
          Thank you for choosing Your Perfect CV. All purchases and payments for our digital service are processed by our authorized Merchant of Record, <strong>Paddle</strong>. As such, all transactions, including refunds, are subject to Paddle's Buyer Terms and Conditions.
        </p>

        {/* --- Section 2: Rephrased the "Guarantee" to a "Policy" with the new 14-day period --- */}
        <h2 className="mt-10 mb-4 font-bold">Our 14-Day Satisfaction Policy</h2>
        <p className="mb-6">
          We want you to be completely satisfied with your purchase. If you are not happy with our service for any reason, we offer a <strong>14-day satisfaction policy</strong> on your initial purchase. This means you can request a full refund within <strong>14 days</strong> of your first payment.
        </p>
        <p className="mb-6">
          This policy is our commitment to you, which we will ask Paddle to honor on your behalf. Please note that as per Paddle's terms, refunds may be refused in cases of fraud or abuse.
        </p>
        
        {/* --- Section 3: Added section on Subscriptions, referencing the 14-day policy --- */}
        <h2 className="mt-10 mb-4 font-bold">Subscription Cancellations</h2>
        <p className="mb-6">
          If you are on a recurring subscription plan, you can cancel at any time. Your cancellation will take effect at the end of your current billing period, and you will not be charged again. <strong>No refunds are provided for unused portions of a subscription period.</strong> The 14-day satisfaction policy applies only to the very first payment of your subscription.
        </p>

        {/* --- Section 4: Acknowledged statutory rights, which now align with your policy duration --- */}
        <h2 className="mt-10 mb-4 font-bold">Statutory Consumer Rights</h2>
        <p className="mb-6">
          For consumers in certain regions (such as the EU and UK), you have a statutory right to cancel your purchase within 14 days. Because Your Perfect CV is a digital service made available for immediate use, you agree to waive this cancellation right upon accessing the service. Our <strong>14-Day Satisfaction Policy</strong> is provided to ensure you have a risk-free trial period, aligning with these consumer protection standards.
        </p>

        {/* --- Section 5: Clear instructions on how to request a refund within the 14-day window --- */}
        <h2 className="mt-10 mb-4 font-bold">How to Request a Refund</h2>
        <p className="mb-6">
          To request a refund under our 14-day policy, you must contact Paddle Support directly within <strong>14 days</strong> of your purchase. They handle all billing and will process your request.
        </p>
        <p className="mb-6">
          You can contact Paddle Support here: <strong><a href="https://paddle.net" className="text-blue-600 hover:underline">https://paddle.net</a></strong>. Please have your order number or the email address you used to purchase ready.
        </p>
        
        {/* --- Section 6: Your contact info --- */}
        <h2 className="mt-10 mb-4 font-bold">Contact Us</h2>
        <p className="mb-4">
          If you have questions about our service, features, or your account (non-billing related), please feel free to contact us at: <a href="mailto:support@yourperfectcv.com" className="text-blue-600 hover:underline">support@yourperfectcv.com</a>
        </p>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
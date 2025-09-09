import React from 'react';

const RefundPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 bg-white">
      <div className="prose lg:prose-xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: July 22, 2025</p>

        <p className="mb-6">
          Your Perfect CV is a digital service. **All payments are non-refundable.**
        </p>
        <p className="mb-6">
          As our authorized Merchant of Record, all transactions, including refunds, are handled by **Paddle**.
          If you believe you are entitled to a refund under a specific circumstance, you must contact Paddle directly to initiate a request.
          Their refund process is outlined in their policies.
        </p>
        <p className="mb-6">
          To request a refund, please contact Paddle Support directly: **<a href="https://paddle.net" className="text-blue-600 hover:underline">https://paddle.net</a>**.
        </p>

        <h2 className="mt-10 mb-4 font-bold">Contact Us</h2>
        <p className="mb-4">
          For any questions regarding your subscription or our services, please contact us at: <a href="mailto:support@yourperfectcv.com" className="text-blue-600 hover:underline">support@yourperfectcv.com</a>
        </p>

      </div>
    </div>
  );
};

export default RefundPolicyPage;
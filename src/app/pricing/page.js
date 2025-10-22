"use client";

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import usePaddle from '@/hooks/usePaddle';

const CheckIcon = ({ className }) => (
    <svg className={`flex-shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- 1. CENTRALIZED OBJECT FOR NEW PRICING DATA ---
// All plan details, prices, and Paddle IDs are managed here.
// IMPORTANT: Replace the placeholder priceId values with your actual Paddle Price IDs.
const pricingData = {
    free: { 
        id: 'free', 
        priceId: null, 
        price: 0, 
        cta: 'Get Started' 
    },
    atsPro: { 
        id: 'atsPro', 
        priceId: 'pri_01jyyapwta3majwvc2ezgfbqg5', // <-- REPLACE THIS
        price: 19, 
        cta: 'Choose ATS Pro' 
    },
    aiPro: { 
        id: 'aiPro', 
        priceId: 'pri_01jyyar1w1y9m3xqzj3gqd1fve', // <-- REPLACE THIS
        price: 25, 
        cta: 'Choose AI Pro' 
    },
    ultimate: { 
        id: 'ultimate', 
        priceId: 'pri_01jyyapwta3majwvc2ezgfbqg5', // <-- REPLACE THIS
        price: 35, 
        cta: 'Go Ultimate' 
    },
};

const plansDetails = [
    {
        name: 'Free',
        id: 'free',
        description: 'For users starting their journey with essential tools.',
        features: [
            'Manual CV Creation',
            'Basic Templates',
            'TXT/PDF Download (with watermark)',
        ],
        isPopular: false,
    },
    {
        name: 'ATS Pro',
        id: 'atsPro',
        description: 'Optimize your CV for applicant tracking systems.',
        features: [
            '15 ATS Scans per month',
            'Premium Templates',
            'Unlimited Manual CV Downloads',
        ],
        isPopular: false,
    },
    {
        name: 'AI Pro',
        id: 'aiPro',
        description: 'Leverage AI to craft professional CVs instantly.',
        features: [
            'Unlimited AI CV Generation',
            'Premium Templates',
            'Unlimited Manual CV Downloads',
        ],
        isPopular: false,
    },
    {
        name: 'Ultimate',
        id: 'ultimate',
        description: 'The complete toolkit for the serious job seeker.',
        features: [
            'Unlimited AI CV Generation',
            'Unlimited ATS Scans',
            'All Premium Templates & Features',
        ],
        isPopular: true,
    }
];

const PricingPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const router = useRouter();

    const handlePurchaseSuccess = (data) => {
        console.log('✅ Checkout completed successfully!', data);
        router.push('/dashboard?purchase=success');
    };

    const { paddle, isPaddleReady } = usePaddle({ onCheckoutComplete: handlePurchaseSuccess });

    const handleCheckout = (planId) => {
        if (authLoading || !isPaddleReady || !paddle || planId === 'free') return;
        
        if (!isAuthenticated || !user) {
            router.push(`/login?from=/pricing&plan=${planId}`);
            return;
        }

        setIsCheckoutLoading(true);
        const priceIdToUse = pricingData[planId]?.priceId;

        if (!priceIdToUse) {
            console.error(`No priceId found for plan: ${planId}`);
            setIsCheckoutLoading(false);
            return;
        }

        try {
            paddle.Checkout.open({
                items: [{ priceId: priceIdToUse, quantity: 1 }],
                customer: { email: user.email },
                customData: { user_id: user.id },
                settings: { displayMode: 'overlay' }
            });
        } catch (error) {
            console.error("Paddle Checkout Error:", error);
            alert("An error occurred while preparing the checkout.");
        } finally {
            // Paddle's overlay will close, unsetting the loading state is handled by the overlay's close event implicitly
            // But we add a timeout as a fallback.
            setTimeout(() => setIsCheckoutLoading(false), 3000);
        }
    };
    
    const getButtonText = (planId) => {
        if (authLoading) return 'Authenticating...';
        if (!isPaddleReady) return 'Initializing...';
        if (isCheckoutLoading) return 'Processing...';
        
        // Check if the user is already on this specific plan
        if (user?.planId === planId) {
            return 'Current Plan';
        }
        
        return pricingData[planId]?.cta || 'Select Plan';
    };

    return (
        <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        The Right Plan for Your Career
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Choose the plan that best fits your job-seeking needs. All plans are billed monthly.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-x-6">
                    {plansDetails.map((plan) => {
                        const priceInfo = pricingData[plan.id];
                        const isCurrentPlan = user?.planId === plan.id;

                        return (
                            <div key={plan.id} className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col transition-transform transform hover:scale-105 ${plan.isPopular ? 'border-2 border-blue-600 shadow-xl' : 'border-gray-200'}`}>
                                {plan.isPopular && <div className="absolute top-0 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">Best Value</div>}
                                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                                <p className="mt-4 text-gray-500 h-12">{plan.description}</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-extrabold text-gray-900">${priceInfo.price}</span>
                                    {plan.id !== 'free' && <span className="text-lg font-medium text-gray-500">/month</span>}
                                </div>
                                <ul className="mt-6 space-y-4">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start"><CheckIcon className="w-6 h-6 text-blue-500 mr-2" /> <span>{feature}</span></li>
                                    ))}
                                </ul>
                                <div className="flex-grow" />
                                <div className="mt-8">
                                    {plan.id === 'free' ? (
                                        <Link href="/register" className="block w-full bg-gray-100 text-gray-700 py-3 px-6 border border-transparent rounded-md font-semibold text-center hover:bg-gray-200">Get Started</Link>
                                    ) : (
                                        <button onClick={() => handleCheckout(plan.id)} disabled={authLoading || !isPaddleReady || isCheckoutLoading || isCurrentPlan} className={`w-full py-3 px-6 border border-transparent rounded-md font-semibold transition-colors ${isCurrentPlan ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait'}`}>
                                            {getButtonText(plan.id)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- 3. NEW: FEATURE COMPARISON TABLE --- */}
                <div className="mt-24">
                    <h2 className="text-3xl font-bold text-center text-gray-900">Compare All Features</h2>
                    <div className="mt-8 max-w-5xl mx-auto">
                        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Feature</th>
                                        <th scope="col" className="px-6 py-4 text-center">Free</th>
                                        <th scope="col" className="px-6 py-4 text-center">ATS Pro</th>
                                        <th scope="col" className="px-6 py-4 text-center">AI Pro</th>
                                        <th scope="col" className="px-6 py-4 text-center font-bold text-blue-600">Ultimate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b"><td className="px-6 py-4 font-semibold text-gray-900">Manual CV Creation</td><td className="px-6 py-4 text-center text-green-500">✅</td><td className="px-6 py-4 text-center text-green-500">✅</td><td className="px-6 py-4 text-center text-green-500">✅</td><td className="px-6 py-4 text-center text-green-500">✅</td></tr>
                                    <tr className="bg-gray-50 border-b"><td className="px-6 py-4 font-semibold text-gray-900">Templates</td><td className="px-6 py-4 text-center">Basic</td><td className="px-6 py-4 text-center">Premium</td><td className="px-6 py-4 text-center">Premium</td><td className="px-6 py-4 text-center">Premium</td></tr>
                                    <tr className="bg-white border-b"><td className="px-6 py-4 font-semibold text-gray-900">CV Downloads</td><td className="px-6 py-4 text-center">Watermarked</td><td className="px-6 py-4 text-center">Unlimited</td><td className="px-6 py-4 text-center">Unlimited</td><td className="px-6 py-4 text-center">Unlimited</td></tr>
                                    <tr className="bg-gray-50 border-b"><td className="px-6 py-4 font-semibold text-gray-900">AI CV Generation</td><td className="px-6 py-4 text-center text-red-500">❌</td><td className="px-6 py-4 text-center text-red-500">❌</td><td className="px-6 py-4 text-center text-green-500">Unlimited</td><td className="px-6 py-4 text-center text-green-500">Unlimited</td></tr>
                                    <tr className="bg-white"><td className="px-6 py-4 font-semibold text-gray-900">ATS Scans</td><td className="px-6 py-4 text-center text-red-500">❌</td><td className="px-6 py-4 text-center">15 / month</td><td className="px-6 py-4 text-center text-red-500">❌</td><td className="px-6 py-4 text-center text-green-500">Unlimited</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- 4. UPDATED: FAQ SECTION --- */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900">Frequently Asked Questions</h2>
                    <div className="mt-8 space-y-4">
                        <details className="p-4 bg-white rounded-lg shadow-sm cursor-pointer group"><summary className="font-semibold list-none flex justify-between items-center">What's the difference between AI Pro and ATS Pro?<span className="text-gray-400 group-open:rotate-45 transform transition-transform">+</span></summary><p className="mt-2 text-gray-600">ATS Pro is designed to optimize your existing CV against job descriptions using our scanner. AI Pro is focused on creating new, high-quality CV content from scratch using AI. The Ultimate plan gives you both, offering the complete toolkit for your job search.</p></details>
                        <details className="p-4 bg-white rounded-lg shadow-sm cursor-pointer group"><summary className="font-semibold list-none flex justify-between items-center">Can I cancel my subscription at any time?<span className="text-gray-400 group-open:rotate-45 transform transition-transform">+</span></summary><p className="mt-2 text-gray-600">Yes, you can cancel your subscription at any time from your dashboard. You will retain access to premium features until the end of your current billing period.</p></details>
                        <details className="p-4 bg-white rounded-lg shadow-sm cursor-pointer group"><summary className="font-semibold list-none flex justify-between items-center">What happens to my CVs if I cancel?<span className="text-gray-400 group-open:rotate-45 transform transition-transform">+</span></summary><p className="mt-2 text-gray-600">You will always have access to your created CVs. If you downgrade to the Free plan, you will lose access to premium features and templates, but you can still view, manually edit, and download your existing documents (with a watermark).</p></details>
                        <details className="p-4 bg-white rounded-lg shadow-sm cursor-pointer group"><summary className="font-semibold list-none flex justify-between items-center">Do you offer refunds?<span className="text-gray-400 group-open:rotate-45 transform transition-transform">+</span></summary><p className="mt-2 text-gray-600">Due to the nature of digital services, we generally do not offer refunds. However, if you have an issue with your subscription, please contact our support team, and we will do our best to help.</p></details>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PricingPage;
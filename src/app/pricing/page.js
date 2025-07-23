"use client";

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import usePaddle from '@/hooks/usePaddle';

const CheckIcon = ({ className }) => (
    <svg className={`flex-shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- 1. A CENTRALIZED OBJECT FOR ALL PRICING DATA ---
// Editing prices and features is now done in one place.
const pricingData = {
    monthly: {
        pro: { id: 'pro_monthly', priceId: 'pri_01jyyapwta3majwvc2ezgfbqg5', price: 10, cta: 'Go Pro' },
    },
    yearly: {
        pro: { id: 'pro_yearly', priceId: 'pri_01jyyar1w1y9m3xqzj3gqd1fve', price: 99, cta: 'Go Pro Yearly' },
    },
    oneTime: {
        ats: { id: 'ats', priceId: 'pri_01jyyas2y7hvm4s997w6c0pvk3', price: 5, cta: 'Buy 3 Scans' },
    },
    free: { id: 'free', price: 0, cta: 'Get Started' }
};

const plansDetails = [
    {
        name: 'Free',
        id: 'free',
        description: 'For casual users getting started.',
        features: [
            'Manual CV Builder',
            'Unlimited PDF Downloads',
            'Create Multiple CVs',
        ],
        isPopular: false,
    },
    {
        name: 'Pro',
        id: 'pro',
        description: 'For serious job seekers who want the best tools.',
        features: [
            'Everything in Free, plus:',
            'Premium AI Co-Pilot Editor',
            'Granular AI Text Refinement',
            'Real-time Job Matcher',
            'Unlimited ATS Score Checks',
        ],
        isPopular: true,
    },
    {
        name: 'ATS Scan Pack',
        id: 'ats',
        description: 'Perfect if you already have a CV.',
        features: [
            '3 ATS Score Checks',
            'Use against any 3 job descriptions',
            'No subscription required',
        ],
        isPopular: false,
    }
];

const PricingPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const router = useRouter();

    const handlePurchaseSuccess = (data) => {
        console.log('✅ Checkout completed successfully!', data);
        router.push('/dashboard?purchase=success');
    };

    const { paddle, isPaddleReady } = usePaddle({ onCheckoutComplete: handlePurchaseSuccess });

    const handleCheckout = (planId) => {
        if (authLoading || !isPaddleReady || !paddle) return;
        if (!isAuthenticated || !user) {
            router.push('/login?from=/pricing');
            return;
        }

        setIsCheckoutLoading(true);
        let priceIdToUse;

        if (planId === 'pro') {
            priceIdToUse = pricingData[billingCycle].pro.priceId;
        } else if (planId === 'ats') {
            priceIdToUse = pricingData.oneTime.ats.priceId;
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
            setTimeout(() => setIsCheckoutLoading(false), 3000);
        }
    };

    const getButtonText = (planId) => {
        if (authLoading) return 'Authenticating...';
        if (!isPaddleReady) return 'Initializing...';
        if (isCheckoutLoading) return 'Processing...';
        
        // --- 2. INTELLIGENT BUTTON TEXT ---
        if (user?.planId?.startsWith('pro') && planId === 'pro') {
            return 'Current Plan';
        }
        
        if (planId === 'pro') return pricingData[billingCycle].pro.cta;
        if (planId === 'ats') return pricingData.oneTime.ats.cta;
        return 'Get Started';
    };

    return (
        <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        The Right Plan for Your Career
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Choose the plan that best fits your job-seeking needs.
                    </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="mt-10 flex justify-center items-center">
                    <span className={`font-medium ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-500'}`}>Monthly</span>
                    <label htmlFor="billing-cycle-toggle" className="relative inline-flex items-center cursor-pointer mx-4">
                        <input type="checkbox" id="billing-cycle-toggle" className="sr-only peer" checked={billingCycle === 'yearly'} onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')} />
                        <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:peer-checked:translate-x-full"></div>
                    </label>
                    <span className={`font-medium ${billingCycle === 'yearly' ? 'text-blue-600' : 'text-gray-500'}`}>
                        Yearly <span className="text-green-500 font-bold">(Save 40%!)</span>
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
                    {plansDetails.map((plan) => {
                        const isPro = plan.id === 'pro';
                        const isATS = plan.id === 'ats';
                        const isFree = plan.id === 'free';
                        
                        const priceInfo = isPro ? pricingData[billingCycle].pro : (isATS ? pricingData.oneTime.ats : pricingData.free);
                        const isCurrentPlan = user?.planId?.startsWith('pro') && isPro;

                        return (
                            <div key={plan.id} className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col transition-transform transform hover:scale-105 ${plan.isPopular ? 'border-2 border-blue-600 shadow-xl' : ''}`}>
                                {plan.isPopular && <div className="absolute top-0 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">Most Popular</div>}
                                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                                <p className="mt-4 text-gray-500">{plan.description}</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-extrabold text-gray-900">${priceInfo.price}</span>
                                    {!isFree && <span className="text-lg font-medium text-gray-500">/{isATS ? 'one-time' : (billingCycle === 'monthly' ? 'mo' : 'yr')}</span>}
                                </div>
                                <ul className="mt-6 space-y-4">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start"><CheckIcon className="w-6 h-6 text-blue-500 mr-2" /> <span>{feature}</span></li>
                                    ))}
                                </ul>
                                <div className="flex-grow" />
                                <div className="mt-8">
                                    {isFree ? (
                                        <Link href="/register" className="block w-full bg-gray-100 text-gray-700 py-3 px-6 border border-transparent rounded-md font-semibold text-center hover:bg-gray-200">Get Started</Link>
                                    ) : (
                                        <button onClick={() => handleCheckout(plan.id)} disabled={authLoading || !isPaddleReady || isCheckoutLoading || (isCurrentPlan && plan.id !== 'ats')} className={`w-full py-3 px-6 border border-transparent rounded-md font-semibold transition-colors ${isCurrentPlan ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait'}`}>
                                            {getButtonText(plan.id)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- 3. NEW: FEATURE COMPARISON TABLE --- */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center text-gray-900">Compare Features</h2>
                    <div className="mt-8 max-w-4xl mx-auto">
                        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Feature</th>
                                        <th scope="col" className="px-6 py-3 text-center">Free</th>
                                        <th scope="col" className="px-6 py-3 text-center">Pro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b"><td className="px-6 py-4 font-semibold text-gray-900">Manual CV Builder</td><td className="px-6 py-4 text-center text-green-500">✅</td><td className="px-6 py-4 text-center text-green-500">✅</td></tr>
                                    <tr className="bg-gray-50 border-b"><td className="px-6 py-4 font-semibold text-gray-900">Unlimited PDF Downloads</td><td className="px-6 py-4 text-center text-green-500">✅</td><td className="px-6 py-4 text-center text-green-500">✅</td></tr>
                                    <tr className="bg-white border-b"><td className="px-6 py-4 font-semibold text-gray-900">AI Co-Pilot Editor</td><td className="px-6 py-4 text-center text-red-500">-</td><td className="px-6 py-4 text-center text-green-500">✅</td></tr>
                                    <tr className="bg-gray-50 border-b"><td className="px-6 py-4 font-semibold text-gray-900">AI Text Refinement</td><td className="px-6 py-4 text-center text-red-500">-</td><td className="px-6 py-4 text-center text-green-500">✅</td></tr>
                                    <tr className="bg-white border-b"><td className="px-6 py-4 font-semibold text-gray-900">Real-time Job Matcher</td><td className="px-6 py-4 text-center text-red-500">-</td><td className="px-6 py-4 text-center text-green-500">✅</td></tr>
                                    <tr className="bg-gray-50"><td className="px-6 py-4 font-semibold text-gray-900">Unlimited ATS Score Checks</td><td className="px-6 py-4 text-center text-red-500">-</td><td className="px-6 py-4 text-center text-green-500">✅</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- 4. NEW: FAQ SECTION --- */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900">Frequently Asked Questions</h2>
                    <div className="mt-8 space-y-4">
                        <details className="p-4 bg-white rounded-lg shadow-sm cursor-pointer"><summary className="font-semibold">Can I cancel my subscription at any time?</summary><p className="mt-2 text-gray-600">Yes, you can cancel your Pro subscription at any time from your dashboard. You will retain access to Pro features until the end of your current billing period.</p></details>
                        <details className="p-4 bg-white rounded-lg shadow-sm cursor-pointer"><summary className="font-semibold">What happens to my CVs if I cancel?</summary><p className="mt-2 text-gray-600">You will always have access to your created CVs. If you cancel your Pro subscription, you will lose access to the premium AI features, but you can still view, edit (with the manual builder), and download all your existing documents.</p></details>
                        <details className="p-4 bg-white rounded-lg shadow-sm cursor-pointer"><summary className="font-semibold">Do you offer refunds?</summary><p className="mt-2 text-gray-600">Due to the nature of digital services, we do not offer refunds. However, if you have an issue with your subscription, please contact our support team, and we will do our best to help.</p></details>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PricingPage;
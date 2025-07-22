// src/app/pricing/page.js

"use client";

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import usePaddle from '@/hooks/usePaddle';

const CheckIcon = () => (
    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
);

const PricingPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const router = useRouter();

    // --- CHANGE 1: Define what happens on successful purchase ---
    const handlePurchaseSuccess = (data) => {
        console.log('✅ Checkout completed successfully!', data);
        // After a successful payment, the user has done their part.
        // We redirect them to the dashboard. The webhook will update their
        // permissions in the background, and our AuthContext will automatically
        // reflect the changes, unlocking features.
        router.push('/dashboard');
    };

    // --- CHANGE 2: Pass the success handler to the usePaddle hook ---
    const { paddle, isPaddleReady } = usePaddle({ onCheckoutComplete: handlePurchaseSuccess });

    useEffect(() => {
        console.log('Auth State on Render:', {
            authLoading,
            isAuthenticated,
            user: user ? { email: user.email, id: user.id } : null,
            isPaddleReady
        });
    }, [authLoading, isAuthenticated, user, isPaddleReady]);

    const plans = {
        monthly: { pro: { priceId: 'pri_01jyyapwta3majwvc2ezgfbqg5', price: 7 } },
        yearly: { pro: { priceId: 'pri_01jyyar1w1y9m3xqzj3gqd1fve', price: 49 } },
        oneTime: { ats: { priceId: 'pri_01jyyas2y7hvm4s997w6c0pvk3', price: 5 } }
    };

    const handleCheckout = (tier) => {
        if (authLoading) {
            return;
        }
        if (!isAuthenticated || !user) {
            router.push('/login?from=/pricing');
            return;
        }
        if (!isPaddleReady || !paddle) {
            alert("Checkout is not quite ready. Please wait a moment and try again.");
            return;
        }

        setIsCheckoutLoading(true);
        let priceIdToUse;
        if (tier === 'pro') priceIdToUse = plans[billingCycle].pro.priceId;
        else if (tier === 'ats') priceIdToUse = plans.oneTime.ats.priceId;

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
            // This timeout is a fallback in case the user closes the modal
            setTimeout(() => setIsCheckoutLoading(false), 3000);
        }
    };
    
    const getButtonText = (baseText) => {
        if (authLoading) return 'Authenticating...';
        if (!isPaddleReady) return 'Initializing Payment...';
        if (isCheckoutLoading) return 'Processing...';
        return baseText;
    };

    const isButtonDisabled = authLoading || !isPaddleReady || isCheckoutLoading;

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        The Right Plan for Your Career
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Choose the plan that best fits your job-seeking needs.
                    </p>
                </div>

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

                <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
                    
                    <div className="relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col">
                        <h3 className="text-2xl font-semibold text-gray-900">Free</h3>
                        <p className="mt-4 text-gray-500">For casual users getting started.</p>
                        <div className="mt-6"><span className="text-5xl font-extrabold text-gray-900">$0</span></div>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start"><CheckIcon /> <span>Manual CV Builder</span></li>
                            <li className="flex items-start"><CheckIcon /> <span>Unlimited PDF Downloads</span></li>
                            <li className="flex items-start"><CheckIcon /> <span>Create Multiple CVs</span></li>
                        </ul>
                        <Link href="/register" className="mt-8 block w-full bg-gray-100 text-gray-700 py-3 px-6 border border-transparent rounded-md font-semibold text-center hover:bg-gray-200">Get Started</Link>
                    </div>

                    <div className="relative p-8 bg-white border-2 border-blue-600 rounded-2xl shadow-xl flex flex-col">
                        <div className="absolute top-0 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">Most Popular</div>
                        <h3 className="text-2xl font-semibold text-gray-900">Pro</h3>
                        <p className="mt-4 text-gray-500">For serious job seekers who want the best tools.</p>
                        <div className="mt-6">
                            <span className="text-5xl font-extrabold text-gray-900">${plans[billingCycle].pro.price}</span>
                            <span className="text-lg font-medium text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start"><CheckIcon /> <span>Everything in Free, plus:</span></li>
                            <li className="flex items-start"><CheckIcon /> <span className="font-bold">Premium AI Co-Pilot Editor</span></li>
                            <li className="flex items-start"><CheckIcon /> <span>Granular AI Text Refinement</span></li>
                            <li className="flex items-start"><CheckIcon /> <span>Real-time Job Matcher</span></li>
                            <li className="flex items-start"><CheckIcon /> <span>Unlimited ATS Score Checks</span></li>
                        </ul>
                        <button onClick={() => handleCheckout('pro')} disabled={isButtonDisabled} className="mt-8 w-full bg-blue-600 text-white py-3 px-6 border border-transparent rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait">
                            {getButtonText('Go Pro')}
                        </button>
                    </div>

                    <div className="relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col">
                        <h3 className="text-2xl font-semibold text-gray-900">ATS Scan Pack</h3>
                        <p className="mt-4 text-gray-500">Perfect if you already have a CV.</p>
                        <div className="mt-6">
                            <span className="text-5xl font-extrabold text-gray-900">${plans.oneTime.ats.price}</span>
                            <span className="text-lg font-medium text-gray-500">/ one-time</span>
                        </div>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start"><CheckIcon /> <span>3 ATS Score Checks</span></li>
                            <li className="flex items-start"><CheckIcon /> <span>Use against any 3 job descriptions</span></li>
                            <li className="flex items-start"><CheckIcon /> <span>No subscription required</span></li>
                        </ul>
                        <button onClick={() => handleCheckout('ats')} disabled={isButtonDisabled} className="mt-8 w-full bg-green-500 text-white py-3 px-6 border border-transparent rounded-md font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-wait">
                            {getButtonText('Buy 3 Scans')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
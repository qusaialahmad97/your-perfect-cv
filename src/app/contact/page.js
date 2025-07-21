"use client";

import React, { useState } from 'react';
import axios from 'axios';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const { name, email, message } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResponseMessage('');
        setIsError(false);

        try {
            await axios.post('/api/contact', formData);
            
            // On success
            setIsError(false);
            setResponseMessage('Your message has been sent successfully! We will get back to you shortly.');
            // Clear the form
            setFormData({ name: '', email: '', message: '' });

        } catch (err) {
            setIsError(true);
            const message = err.response?.data?.message || 'Failed to send message. Please try again later.';
            setResponseMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Contact Us
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Have a question or feedback? We'd love to hear from you.
                    </p>
                </div>
                
                <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
                    <form onSubmit={onSubmit}>
                        <div className="grid grid-cols-1 gap-y-6">
                            <div>
                                <label htmlFor="name" className="sr-only">Full name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={name}
                                    onChange={onChange}
                                    className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                    placeholder="Full name"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={onChange}
                                    autoComplete="email"
                                    className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                    placeholder="Email address"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    value={message}
                                    onChange={onChange}
                                    className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md"
                                    placeholder="Your message"
                                    required
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                                >
                                    {isLoading ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </form>
                    {responseMessage && (
                        <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
                            {responseMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
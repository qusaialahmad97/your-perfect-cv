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
            setIsError(false);
            setResponseMessage('✅ Your message has been sent! We’ll get back to you soon.');
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setIsError(true);
            const message = err.response?.data?.message || '❌ Failed to send message. Please try again.';
            setResponseMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-6">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-10">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-blue-700">Get in Touch</h1>
                    <p className="mt-3 text-gray-600 text-lg">
                        We'd love to hear your thoughts, questions, or feedback.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onChange={onChange}
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={onChange}
                            autoComplete="email"
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700">Your Message</label>
                        <textarea
                            name="message"
                            id="message"
                            rows="5"
                            value={message}
                            onChange={onChange}
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            placeholder="Write your message here..."
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>

                {responseMessage && (
                    <p className={`mt-6 text-center text-sm font-medium ${isError ? 'text-red-600' : 'text-green-600'}`}>
                        {responseMessage}
                    </p>
                )}
            </div>
        </section>
    );
};

export default ContactPage;

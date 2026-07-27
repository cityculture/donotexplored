'use client';

import { useState } from 'react';

interface NewsletterSignupProps {
    variant?: 'sidebar' | 'inline';
}

export default function NewsletterSignup({ variant = 'inline' }: NewsletterSignupProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: email.split('@')[0], // Use email prefix as name
                    email: email,
                    submission_type: 'newsletter',
                    source: variant === 'sidebar' ? 'newsletter_sidebar' : 'newsletter_inline',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe');
            }
            
            setStatus('success');
            setMessage(data.message || 'Thank you for subscribing!');
            setEmail('');
            
            // Reset success message after 5 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    const isSidebar = variant === 'sidebar';

    return (
        <div className={isSidebar ? 'mb-8' : 'mt-12 pt-8 border-t border-gray-200'}>
            <div className={isSidebar ? '' : 'max-w-2xl mx-auto'}>
                <h3 className={`font-bold text-gray-900 mb-3 ${isSidebar ? 'text-lg' : 'text-xl'}`}>
                    Subscribe to Our Newsletter
                </h3>
                <p className={`text-gray-600 mb-4 ${isSidebar ? 'text-sm' : 'text-base'}`}>
                    Get the latest blog posts and updates delivered to your inbox.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                status === 'error' ? 'border-red-500' : ''
                            }`}
                            disabled={status === 'loading' || status === 'success'}
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                                isSidebar ? 'sm:w-auto' : ''
                            }`}
                        >
                            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                        </button>
                    </div>
                    
                    {message && (
                        <p className={`text-sm ${
                            status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
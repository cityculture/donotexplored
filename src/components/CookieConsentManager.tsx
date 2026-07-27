'use client';

import { useEffect, useState } from 'react';
import { Cookie, Shield, BarChart, Target, Settings, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';

declare global {
    interface Window {
        dataLayer: Record<string, unknown>[];
        gtag?: (...args: unknown[]) => void;
    }
}

interface ConsentPreferences {
    analytics_storage: 'granted' | 'denied';
    ad_storage: 'granted' | 'denied';
    ad_user_data: 'granted' | 'denied';
    ad_personalization: 'granted' | 'denied';
    functionality_storage?: 'granted' | 'denied';
    personalization_storage?: 'granted' | 'denied';
    security_storage?: 'granted' | 'denied';
}

const STORAGE_KEY = 'consent_preferences';

export default function CookieConsentManager() {
    const [isMounted, setIsMounted] = useState(false);
    const [preferences, setPreferences] = useState<ConsentPreferences>({
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted',
    });

    useEffect(() => {
        setIsMounted(true);
        // Load saved preferences
        const savedConsent = localStorage.getItem(STORAGE_KEY);
        if (savedConsent) {
            const savedPrefs = JSON.parse(savedConsent);
            setPreferences(savedPrefs);
        }
    }, []);

    const updateConsent = (newPreferences: ConsentPreferences) => {
        setPreferences(newPreferences);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));

        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', newPreferences);
        }
    };

    const acceptAll = () => {
        const allGranted: ConsentPreferences = {
            analytics_storage: 'granted',
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            functionality_storage: 'granted',
            personalization_storage: 'granted',
            security_storage: 'granted',
        };
        updateConsent(allGranted);
    };

    const rejectAll = () => {
        const allDenied: ConsentPreferences = {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'denied',
            personalization_storage: 'denied',
            security_storage: 'granted',
        };
        updateConsent(allDenied);
    };

    const togglePreference = (key: keyof ConsentPreferences) => {
        if (key === 'security_storage') return;

        const newPreferences = {
            ...preferences,
            [key]: preferences[key] === 'granted' ? 'denied' : 'granted',
        };
        updateConsent(newPreferences);
    };

    return (
        <div className="space-y-8">
            {/* Last Updated & Intro */}
            <div className="bg-blue-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <p className="font-semibold text-lg mb-2 text-blue-100">Last updated: {isMounted ? new Date().toLocaleDateString() : ''}</p>
                    <p className="leading-relaxed text-lg text-blue-50">
                        This Cookie Policy explains how <strong>City Culture</strong> (a brand of <strong>Salty Media Production (opc) Pvt Ltd</strong>) uses cookies and similar tracking technologies on our website.
                        We respect your privacy and give you control over how cookies are used to enhance your browsing experience.
                    </p>
                </div>
            </div>

            {/* Cookie Settings */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shrink-0">
                        <Settings className="w-6 h-6" />
                    </div>
                    <div className="w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Your Cookie Preferences</h2>
                        <p className="text-gray-600 mb-6">
                            You can customize which cookies we use by toggling the options below. Essential cookies are always enabled
                            as they are necessary for the website to function properly.
                        </p>

                        <div className="space-y-4 mb-6">
                            {/* Necessary Cookies */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3 flex-1">
                                    <Shield className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">Necessary Cookies</h4>
                                        <p className="text-sm text-gray-600">
                                            Required for the website to function properly. These cannot be disabled as they are essential for security,
                                            authentication, and core functionality.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 font-medium ml-4 shrink-0">Always Active</span>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3 flex-1">
                                    <BarChart className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h4>
                                        <p className="text-sm text-gray-600">
                                            Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                                            This helps us improve our services and user experience.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePreference('analytics_storage')}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-4 shrink-0 ${preferences.analytics_storage === 'granted' ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${preferences.analytics_storage === 'granted' ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Advertising Cookies */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3 flex-1">
                                    <Target className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">Advertising Cookies</h4>
                                        <p className="text-sm text-gray-600">
                                            Used to deliver personalized advertisements and track campaign performance. These cookies help us
                                            show you relevant content and measure the effectiveness of our marketing efforts.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePreference('ad_storage')}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-4 shrink-0 ${preferences.ad_storage === 'granted' ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${preferences.ad_storage === 'granted' ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Personalization Cookies */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3 flex-1">
                                    <Cookie className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">Personalization Cookies</h4>
                                        <p className="text-sm text-gray-600">
                                            Allow us to personalize your experience by remembering your preferences, settings, and interests.
                                            This helps us provide a more tailored browsing experience.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePreference('personalization_storage')}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-4 shrink-0 ${preferences.personalization_storage === 'granted' ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${preferences.personalization_storage === 'granted' ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2 border-t border-gray-200">
                            <button
                                onClick={acceptAll}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Accept All Cookies
                            </button>
                            <button
                                onClick={rejectAll}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Reject All
                            </button>
                        </div>

                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex gap-3">
                            <Info className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-green-800">
                                <strong>Settings saved!</strong> Your cookie preferences have been updated and will be applied immediately.
                                You can change these settings at any time by visiting this page.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Are Cookies */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                        <Cookie className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                        <p className="leading-relaxed text-gray-600 mb-4">
                            Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website.
                            They are widely used to make websites work more efficiently and provide information to website owners.
                        </p>
                        <p className="leading-relaxed text-gray-600">
                            Cookies allow websites to recognize your device and store some information about your preferences or past actions.
                            This helps improve your browsing experience by remembering your settings and providing personalized content.
                        </p>
                    </div>
                </div>
            </section>

            {/* Types of Cookies We Use */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shrink-0">
                        <BarChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>

                        <div className="space-y-6">
                            <div className="bg-purple-50 p-5 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Essential Cookies</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    These cookies are strictly necessary for the website to function properly. They enable core functionality
                                    such as security, network management, and accessibility.
                                </p>
                                <ul className="space-y-1 text-gray-600 text-sm pl-4">
                                    <li>• Session management and authentication</li>
                                    <li>• Security and fraud prevention</li>
                                    <li>• Load balancing and performance</li>
                                    <li>• Remembering your login status</li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 p-5 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics Cookies</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    These cookies help us understand how visitors interact with our website by collecting and reporting
                                    information anonymously.
                                </p>
                                <ul className="space-y-1 text-gray-600 text-sm pl-4">
                                    <li>• Page views and navigation patterns</li>
                                    <li>• Time spent on pages</li>
                                    <li>• Error messages and performance issues</li>
                                    <li>• Popular content and features</li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 p-5 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Advertising Cookies</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                                </p>
                                <ul className="space-y-1 text-gray-600 text-sm pl-4">
                                    <li>• Ad relevance and personalization</li>
                                    <li>• Campaign performance measurement</li>
                                    <li>• Frequency capping (limiting ad repetition)</li>
                                    <li>• Conversion tracking</li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 p-5 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Functional Cookies</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                                </p>
                                <ul className="space-y-1 text-gray-600 text-sm pl-4">
                                    <li>• Language preferences</li>
                                    <li>• Region or location settings</li>
                                    <li>• User interface preferences</li>
                                    <li>• Previously viewed content</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Managing Cookies */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 shrink-0">
                        <Settings className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                        <p className="leading-relaxed text-gray-600 mb-4">
                            You have several options for managing cookies:
                        </p>
                        <ul className="space-y-3 text-gray-600 pl-4 border-l-2 border-teal-100">
                            <li>
                                <strong>Cookie Preferences on This Page:</strong> Use the cookie management section above to customize
                                which cookies you allow.
                            </li>
                            <li>
                                <strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or alert you when cookies
                                are being sent. However, disabling cookies may affect website functionality.
                            </li>
                            <li>
                                <strong>Third-Party Opt-Out:</strong> Some third-party services offer opt-out mechanisms through their
                                own websites (e.g., Google Analytics opt-out).
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Third-Party Cookies */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-white rounded-2xl text-blue-600 shrink-0 shadow-sm">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                            <p className="leading-relaxed text-gray-700 mb-4">
                                We may use third-party services that set their own cookies on your device. These services include:
                            </p>
                            <ul className="space-y-2 text-gray-700 pl-4 border-l-2 border-blue-200">
                                <li>• <strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                                <li>• <strong>Google Tag Manager:</strong> For managing tracking tags and scripts</li>
                                <li>• <strong>Payment Processors:</strong> For secure payment processing</li>
                                <li>• <strong>Social Media Platforms:</strong> For social sharing and integration features</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cookie Duration */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Duration</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Cookies</h3>
                                <p className="leading-relaxed text-gray-600">
                                    These temporary cookies are deleted when you close your browser. They enable basic website functionality
                                    during your visit.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Persistent Cookies</h3>
                                <p className="leading-relaxed text-gray-600">
                                    These cookies remain on your device for a set period or until you delete them. They remember your
                                    preferences and settings for future visits.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Changes to Cookie Policy */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shrink-0">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Cookie Policy</h2>
                        <p className="leading-relaxed text-gray-600 mb-4">
                            We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                            operational, legal, or regulatory reasons. We will notify you of any material changes by:
                        </p>
                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-gray-100">
                            <li>• Posting the updated policy on this page with a new &quot;Last Updated&quot; date</li>
                            <li>• Sending an email notification to registered members (for significant changes)</li>
                            <li>• Displaying a notice on our website</li>
                        </ul>
                        <p className="leading-relaxed text-gray-600 mt-4">
                            We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="bg-blue-600 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-4">Questions About Cookies?</h2>
                    <p className="mb-4 leading-relaxed text-blue-50">
                        If you have any questions about our use of cookies or this Cookie Policy, please contact us at{' '}
                        <a href="mailto:citycultureteam@gmail.com" className="underline hover:text-white">
                            citycultureteam@gmail.com
                        </a>
                        {' '}or through our{' '}
                        <Link href="/contact" className="underline hover:text-white">
                            contact page
                        </Link>.
                    </p>
                    <p className="leading-relaxed text-blue-50">
                        For more information about our data practices, please review our{' '}
                        <Link href="/privacy-policy" className="underline hover:text-white">
                            Privacy Policy
                        </Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}

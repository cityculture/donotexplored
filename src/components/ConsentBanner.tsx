'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface ConsentPreferences {
  [key: string]: 'granted' | 'denied' | undefined;
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted' | 'denied';
}

const STORAGE_KEY = 'consent_preferences';

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted', // Always granted for necessary functionality
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    
    if (!savedConsent) {
      // Set default consent (denied) before GTM loads
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          functionality_storage: 'denied',
          personalization_storage: 'denied',
          security_storage: 'granted',
        });
      }
      
      // Wait a bit for GTM to initialize, then show banner
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = JSON.parse(savedConsent) as ConsentPreferences;
      setPreferences(savedPrefs);
      
      // Update consent with saved preferences
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', savedPrefs);
      }
    }
  }, []);

  const updateConsent = useCallback((newPreferences: ConsentPreferences) => {
    setPreferences(newPreferences);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    
    // Update Google Consent Mode
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', newPreferences);
    }
    
    setShowBanner(false);
  }, []);

  // Handle click outside banner to accept all cookies
  useEffect(() => {
    if (!showBanner) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (bannerRef.current && !bannerRef.current.contains(event.target as Node)) {
        // User clicked outside the banner - accept all cookies
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
      }
    };

    // Add event listener after a short delay to avoid immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showBanner, updateConsent]);

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

  if (!showBanner) {
    // Don't show anything when banner is dismissed
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg" ref={bannerRef}>
      <div className="max-w-6xl mx-auto px-3 py-2">
        {/* Banner view - compact design */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg
              className="w-4 h-4 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <p className="text-xs text-gray-600 flex-shrink-0">
              We use cookies to enhance your experience. By continuing to browse, you agree to our use of cookies.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/cookie-policy"
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              Manage Preferences
            </Link>
            <button
              onClick={rejectAll}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

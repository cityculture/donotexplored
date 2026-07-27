'use client';

import { sendGAEvent } from "@/lib/gtag";

export default function HeroButtons() {
    const handleEventsClick = () => {
        sendGAEvent({
            action: 'click',
            category: 'homepage_cta',
            label: 'See Upcoming Events'
        });
    };

    const handleAboutClick = () => {
        sendGAEvent({
            action: 'click',
            category: 'homepage_cta',
            label: 'Read Our Story'
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 sm:w-auto justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 mb-10">
            <a
                href="/events"
                onClick={handleEventsClick}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 hover:scale-105"
            >
                See Upcoming Events
            </a>
            <a
                href="/about"
                onClick={handleAboutClick}
                className="px-8 py-4 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 border border-white/20 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
                Read Our Story
            </a>
        </div>
    );
}

'use client';

import { Instagram, Youtube, Users, Facebook, Linkedin as LinkedinIcon } from 'lucide-react';
import { sendGAEvent } from "@/lib/gtag";

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24h-2.19L17.61 20.644z" />
    </svg>
);

const socialLinks = [
    {
        name: 'Instagram',
        url: 'https://www.instagram.com/citycultureindia/',
        icon: Instagram,
        color: 'text-pink-600 hover:text-pink-700',
        bg: 'bg-pink-100'
    },
    {
        name: 'X (Twitter)',
        url: 'https://x.com/cityculturein',
        icon: XIcon,
        color: 'text-gray-900 hover:text-black',
        bg: 'bg-gray-100'
    },
    {
        name: 'YouTube',
        url: 'https://www.youtube.com/@citycultureindia',
        icon: Youtube,
        color: 'text-red-600 hover:text-red-700',
        bg: 'bg-red-100'
    },
    {
        name: 'Reddit',
        url: 'https://www.reddit.com/user/CityCultureIndia/',
        icon: Users,
        color: 'text-orange-600 hover:text-orange-700',
        bg: 'bg-orange-100'
    },
    {
        name: 'Facebook',
        url: 'https://www.facebook.com/citycultureevents',
        icon: Facebook,
        color: 'text-blue-600 hover:text-blue-700',
        bg: 'bg-blue-50'
    },
    {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/company/citycultureindia/',
        icon: LinkedinIcon,
        color: 'text-blue-700 hover:text-blue-800',
        bg: 'bg-blue-100'
    }
];

export default function SocialLinks({ className = '', variant = 'default' }: { className?: string, variant?: 'default' | 'footer' }) {
    if (variant === 'footer') {
        return (
            <div className={`flex gap-5 ${className}`}>
                {socialLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.color} transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
                        aria-label={`Follow us on ${link.name}`}
                        onClick={() => sendGAEvent({
                            action: 'click',
                            category: 'social_link',
                            label: `Footer: ${link.name}`
                        })}
                    >
                        <link.icon className="w-5 h-5" />
                    </a>
                ))}
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
            {socialLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${link.bg} ${link.color} transition-transform hover:scale-110 shadow-sm`}
                    aria-label={`Follow us on ${link.name}`}
                    onClick={() => sendGAEvent({
                        action: 'click',
                        category: 'social_link',
                        label: `Main: ${link.name}`
                    })}
                >
                    <link.icon className="w-6 h-6" />
                </a>
            ))}
        </div>
    );
}

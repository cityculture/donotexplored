'use client';

import Link from 'next/link';
import { sendGAEvent } from "@/lib/gtag";

interface SponsoredAdCardProps {
    url: string;
    title: string;
    description: string;
}

export default function SponsoredAdCard({ url, title, description }: SponsoredAdCardProps) {
    return (
        <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all bg-white"
            onClick={() => sendGAEvent({
                action: 'click',
                category: 'sponsored_content',
                label: `Ad: ${title}`,
                value: 1 // Assigning a value to ad clicks can be useful
            })}
        >
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            Sponsored
                        </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                        {title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-blue-600 font-medium group-hover:underline">
                            Visit Site
                        </span>
                        <svg
                            className="w-3 h-3 text-blue-600 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

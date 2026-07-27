'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

interface Poster {
  id: string
  cover_image_url?: string | null
  vertical_poster_url?: string | null
  title: string
}

export function EventPosterCarousel({ posters }: { posters: Poster[] }) {
  // To create a seamless loop, we repeat the posters array
  const displayPosters = [...posters, ...posters, ...posters]

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/30">
      {/* Grey Dotted Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl sm:text-6xl font-black text-slate-950 mb-6 tracking-tighter">
            Building India's No 1 event discovery<br />
            Platform <span className="text-indigo-600">City Culture</span>
          </h2>
          <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.3em] max-w-2xl mx-auto">
             Elevating the way you experience your city.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-4 animate-marquee whitespace-nowrap py-4">
            {displayPosters.map((poster, idx) => {
              const isVertical = idx % 2 === 0
              return (
                <div 
                  key={`${poster.id}-${idx}`}
                  className={`flex-none rounded-2xl overflow-hidden relative border border-white shadow-xl transition-all duration-500 hover:scale-105 hover:z-20 ${
                    isVertical 
                      ? 'w-[180px] sm:w-[220px] aspect-[3/4]' 
                      : 'w-[280px] sm:w-[350px] aspect-[16/9]'
                  }`}
                >
                  <Image
                    src={(isVertical ? poster.vertical_poster_url : poster.cover_image_url) || poster.cover_image_url || poster.vertical_poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
                    alt={poster.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                     <p className="text-white font-black text-[10px] sm:text-xs uppercase tracking-widest leading-tight">{poster.title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}

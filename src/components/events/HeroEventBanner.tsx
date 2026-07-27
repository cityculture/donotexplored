'use client'

import { useState, useEffect } from 'react'
import { EventWithDetails } from '@/types/api.types'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

interface HeroEventBannerProps {
  events: EventWithDetails[]
}

export default function HeroEventBanner({ events }: HeroEventBannerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!events || events.length === 0) return null

  // For now, we take the first featured event
  const event = events[0]
  const startDate = new Date(event.start_datetime)
  const formattedDate = startDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950 rounded-3xl group">
      <div className="relative w-full overflow-hidden">
        {/* Mobile: 4:5 Vertical Poster */}
        <div className="block sm:hidden relative aspect-[4/5] w-full">
          <Image
            src={event.vertical_poster_url || event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'}
            alt={event.title}
            fill
            priority
            className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            sizes="100vw"
          />
        </div>
        {/* Desktop: 21:9 Horizontal Banner */}
        <div className="hidden sm:block relative aspect-[21/9] md:aspect-[24/10] w-full">
          <Image
            src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'}
            alt={event.title}
            fill
            priority
            className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-16">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            Featured Event
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-none">
            {event.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-zinc-300 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <span>{isMounted ? formattedDate : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-400" />
              <span>{event.city}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link
              href={`/events/${event.slug}`}
              className="px-8 py-4 bg-white text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
            >
              Book Tickets Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

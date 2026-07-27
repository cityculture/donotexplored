'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { EventWithDetails } from '@/types/api.types'
import { CalendarIcon, MapPinIcon } from 'lucide-react'

interface EventCardProps {
  event: EventWithDetails
}

export function EventCard({ event }: EventCardProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Parsing date
  const startDate = new Date(event.start_datetime || new Date())
  const formattedDate = startDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
  
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  // Format Price Display
  let priceDisplay = 'Free'
  if (event.min_price && event.min_price > 0) {
    priceDisplay = `₹${event.min_price}`
  }

  // Placeholder image fallback
  const imgUrl = event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-xl">
      <Link href={`/events/${event.slug}`} className="block">
        {/* Responsive Image Ratio (Requirement 2 extension) */}
        <div className="relative w-full overflow-hidden bg-gray-100">
          {/* Mobile: 4:5 Ratio with Vertical Poster */}
          <div className="block sm:hidden relative aspect-[4/5] w-full">
            <Image
              src={event.vertical_poster_url || imgUrl}
              alt={event.title || 'Event'}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/* Desktop/Tablet: 2:1 Ratio with Cover Image */}
          <div className="hidden sm:block relative aspect-[2/1] w-full">
            <Image
              src={imgUrl}
              alt={event.title || 'Event'}
              fill
              sizes="(max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {event.category_name && (
            <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm z-10">
              {event.category_name}
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 space-y-1.5">
        {/* Date and Time */}
        <div className="text-[12px] font-bold text-indigo-600 uppercase tracking-tight">
          {isMounted ? `${formattedDate} • ${formattedTime}` : ''}
        </div>

        {/* Host Info */}
        {event.host_display_name && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="relative h-4 w-4 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <Image 
                src={event.host_logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                alt={event.host_display_name} 
                fill 
                className="object-cover"
              />
            </div>
            <Link 
              href={`/hosts/${event.host_username}`}
              className="text-[10px] font-bold text-gray-500 hover:text-indigo-600 transition-colors truncate"
            >
              {event.host_display_name}
            </Link>
          </div>
        )}

        {/* Event Name */}
        <Link href={`/events/${event.slug}`}>
          <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-zinc-950 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>
        </Link>

        {/* Address or Online badge (Requirement 10) */}
        <div className="flex items-center text-[12px] text-gray-600 line-clamp-1">
          {event.event_type === 'online' ? (
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>Online Event</span>
            </div>
          ) : (
            <>
              <MapPinIcon className="mr-1 h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">
                {event.address_line_1?.substring(0, 50) || event.venue_name?.substring(0, 50) || event.city}
              </span>
            </>
          )}
        </div>

        {/* Bottom corner info */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
          <div className="text-sm font-black text-slate-950">
            {priceDisplay}
          </div>
          
          <div className="flex items-center gap-1 text-[12px] font-bold text-gray-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{event.interests_count || 0} Interested</span>
          </div>
        </div>
      </div>
    </div>
  )
}

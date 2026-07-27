'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CalendarIcon, MapPinIcon, Share2Icon } from 'lucide-react'
import { EventWithDetails } from '@/types/api.types'
import { EventInterestBar } from './EventInterestBar'
import { FollowHostButton } from '../members/FollowHostButton'

interface EventDetailHeroProps {
  event: EventWithDetails
  hostProfile: any
  hostUser?: any
  isFollowing: boolean
  isLiked?: boolean
  isSaved?: boolean
  isInterested?: boolean
  minPrice?: number
}

export function EventDetailHero({ 
  event, 
  hostProfile, 
  hostUser,
  isFollowing,
  isLiked = false,
  isSaved = false,
  isInterested = false,
  minPrice = 0
}: EventDetailHeroProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Consolidate profile data from both sources
  const profile = hostProfile || hostUser?.profile

  const startDate = new Date(event.start_datetime)
  const endDate = event.end_datetime ? new Date(event.end_datetime) : null

  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Format times with timezone
  const timeStr = `${startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}${endDate ? ` - ${endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ''} ${event.timezone || ''}`

  return (
    <div className="bg-white">
      {/* Event Image Banner (Requirement 2) */}
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 pt-0 sm:pt-8">
        <div className="relative w-full overflow-hidden sm:rounded-2xl group">
          {/* Mobile: 4:5 Ratio with Vertical Poster */}
          <div className="block sm:hidden relative aspect-[4/5] w-full bg-zinc-100">
            {event.vertical_poster_url ? (
              <Image
                src={event.vertical_poster_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : event.cover_image_url ? (
              <Image
                src={event.cover_image_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20" />
            )}
          </div>

          {/* Desktop/Tablet: 2:1 Ratio with Cover Image */}
          <div className="hidden sm:block relative aspect-[2/1] w-full bg-zinc-100">
            {event.cover_image_url ? (
              <Image
                src={event.cover_image_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20" />
            )}
          </div>

        
        {/* Content overlaid on image bottom */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            {event.category_name && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {event.category_name}
                  </span>
                  {event.tags && event.tags.map((t: any) => (
                    <span key={t.tag.id} className="inline-flex items-center rounded-md bg-indigo-500/30 px-2 py-0.5 text-[10px] font-medium text-indigo-100 backdrop-blur-sm border border-indigo-400/20">
                      #{t.tag.name}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="sm:hidden flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black text-indigo-900 shadow-xl active:scale-95"
                >
                  Book Now
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="hidden sm:block flex-1" />
              <button 
                onClick={() => document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="mb-1 flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl hover:bg-indigo-700 transition transform active:scale-95 w-fit"
              >
                <span>Book Now</span>
                <span className="text-indigo-200">|</span>
                <span>{minPrice > 0 ? `₹${minPrice}` : 'Free'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Event Name below image (Requirement 3) */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-indigo-950 sm:text-5xl lg:text-6xl">
          {event.title}
        </h1>
      </div>

      {/* Action / Info Bar below image */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-zinc-950">{isMounted ? dateStr : ''}</p>
                <p className="text-gray-600">{isMounted ? timeStr : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">
                  {event.event_type === 'online' ? 'Online Event' : event.venue_name || 'Venue TBA'}
                </p>
                <p className="text-gray-600">{event.city ? `${event.city}, ${event.country}` : 'Location Details'}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
             <EventInterestBar 
               eventId={event.id} 
               initialLikes={event.likes_count || 0} 
               initialInterests={event.interests_count || 0} 
               isLiked={isLiked}
               isSaved={isSaved}
               isInterested={isInterested}
             />
             
             <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <Share2Icon className="h-4 w-4" />
                <span className="sr-only">Share</span>
             </button>
          </div>

        </div>
      </div>

      {/* Host Byline (Requirement 5) */}
      <div className="border-b border-gray-200 bg-gray-50">
         <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hosted by</span>
                <div className="flex items-center gap-3">
                  <a 
                    href={`/hosts/${hostProfile?.id || hostUser?.id}`}
                    className="flex items-center gap-2 group"
                  >
                    {profile?.logo_url || hostUser?.avatar_url ? (
                      <img src={profile?.logo_url || hostUser?.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover border border-gray-100" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                          {profile?.organisation_name?.charAt(0) || profile?.display_name?.charAt(0) || hostUser?.full_name?.charAt(0) || hostUser?.username?.charAt(0) || 'H'}
                      </div>
                    )}
                    <span className="text-lg font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                      {profile?.organisation_name || profile?.display_name || hostUser?.full_name || hostUser?.username || event.host_display_name || 'Host'}
                    </span>
                  </a>
                  {hostProfile?.id && (
                    <div className="scale-75 origin-left">
                      <FollowHostButton hostId={hostProfile.id} initialIsFollowing={isFollowing} />
                    </div>
                  )}
                </div>
              </div>

              {/* Co-hosts */}
              {event.cohosts && event.cohosts.length > 0 && (
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                  <span className="text-xs text-gray-400 font-medium">With</span>
                  <div className="flex -space-x-2">
                    {event.cohosts.map((cohost: any) => (
                      <div key={cohost.user.id} className="group relative">
                        {cohost.user.avatar_url ? (
                          <img 
                            src={cohost.user.avatar_url} 
                            alt={cohost.user.full_name || cohost.user.username} 
                            className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm transition hover:scale-110" 
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[10px] font-bold text-indigo-600 shadow-sm transition hover:scale-110">
                            {(cohost.user.full_name || cohost.user.username).charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  )
}

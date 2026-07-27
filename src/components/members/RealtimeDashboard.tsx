'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Heart, Bookmark, Star, Calendar, ArrowRight, LayoutGrid, PlusCircle, ShieldCheck, AlertCircle, Crown, Search, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { CreateHostPageModal } from '../modals/CreateHostPageModal'
import { AttendanceTab } from './AttendanceTab'

export interface DashboardEvent {
  title: string
  slug: string
  cover_image_url: string | null
  start_datetime: string
  refund_policy_text?: string | null
}

export interface DashboardBooking {
  id: string
  booking_ref: string
  status: string | null
  event_id: string
  events: DashboardEvent | null
}

export interface DashboardInteraction {
  id?: string
  event_id: string
  interest_type?: string | null
  events: DashboardEvent | null
}

export interface DashboardHostPage {
  id: string
  user_id: string
  display_name: string | null
  slug: string | null
  logo_url: string | null
  tagline: string | null
  total_events_hosted: number | null
  follower_count: number | null
  rating_avg: number | string | null
  created_at: string | null
  subscriptions?: Array<{
    id: string
    status: string | null
    ends_at: string
    amount: number
    plan_type: string
  }>
}

export interface DashboardReview {
  id: string
  rating: number | null
  review_text: string | null
  created_at: string | null
  events: {
    title: string | null
    slug: string | null
  } | null
}

export interface DashboardFollow {
  id: string
  host_pages: {
    display_name: string | null
    slug: string | null
    logo_url: string | null
  } | null
}

interface RealtimeDashboardProps {
  userId: string
  initialData: {
    bookings: DashboardBooking[]
    saves: DashboardInteraction[]
    likes: DashboardInteraction[]
    interests: DashboardInteraction[]
    hostPages: DashboardHostPage[]
    reviews: DashboardReview[]
    following: DashboardFollow[]
  }
}

export function RealtimeDashboard({ userId, initialData }: RealtimeDashboardProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [data, setData] = useState(initialData)
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const openCreateModal = searchParams.get('openCreateModal') === 'true'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(openCreateModal)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [
      { data: bookingsData },
      { data: savesData },
      { data: likesData },
      { data: interestsData },
      { data: hostPagesData },
      { data: reviewsData },
      { data: followingData }
    ] = await Promise.all([
      supabase.from('bookings').select('id, booking_ref, status, event_id, events!inner(title, cover_image_url, start_datetime, slug, refund_policy_text)').eq('user_id', userId).eq('status', 'confirmed').gte('events.start_datetime', new Date(new Date().setHours(0,0,0,0)).toISOString()).order('start_datetime', { referencedTable: 'events', ascending: true }),
      supabase.from('event_saves').select('event_id, events(title, slug, cover_image_url, start_datetime)').eq('user_id', userId).limit(5),
      supabase.from('event_likes').select('event_id, events(title, slug, cover_image_url, start_datetime)').eq('user_id', userId).limit(5),
      supabase.from('event_interests').select('event_id, interest_type, events(title, slug, cover_image_url, start_datetime)').eq('user_id', userId).limit(5),
      supabase.from('host_pages').select('*, subscriptions(*)').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('event_reviews').select('*, events(title, slug)').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('host_follows').select('*, host_pages(*)').eq('follower_id', userId).limit(10)
    ])

    setData({
      bookings: bookingsData || [],
      saves: savesData || [],
      likes: likesData || [],
      interests: interestsData || [],
      hostPages: hostPagesData || [],
      reviews: reviewsData || [],
      following: followingData || []
    })
  }, [userId, supabase])

  useEffect(() => {
    setIsMounted(true)
    if (typeof window === 'undefined' || (typeof WebSocket !== 'function' && typeof globalThis.WebSocket !== 'function')) {
      return
    }

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_saves', filter: `user_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_likes', filter: `user_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_interests', filter: `user_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'host_pages', filter: `user_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_reviews', filter: `user_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'host_follows', filter: `follower_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchData])

  const renderEventList = (title: string, items: DashboardInteraction[] | DashboardBooking[], icon: React.ReactNode, emptyMsg: string, viewAllPath: string) => (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className="border-b border-gray-50 px-6 py-4 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
          {icon}
          {title}
        </div>
        <Link href={viewAllPath} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-all hover:translate-x-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {items.length > 0 ? (
          items.map((item: DashboardInteraction | DashboardBooking) => {
            const event = item.events
            if (!event) return null
            const date = isMounted ? new Date(event.start_datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
            
            const itemId = 'id' in item ? item.id : item.event_id
            const interestType = 'interest_type' in item ? item.interest_type : null

            return (
              <div key={itemId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  {event.cover_image_url ? (
                    <img src={event.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/events/${event.slug}`} className="truncate text-xs font-black text-gray-900 hover:text-indigo-600 block transition-colors">
                    {event.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">
                    <span>{date}</span>
                    {interestType && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                        {interestType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {emptyMsg}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Upcoming', count: data.bookings.length, icon: <Calendar className="h-4 w-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Saves', count: data.saves.length, icon: <Bookmark className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Likes', count: data.likes.length, icon: <Heart className="h-4 w-4" />, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { label: 'Managed', count: data.hostPages.length, icon: <Crown className="h-4 w-4" />, color: 'text-slate-600', bg: 'bg-slate-50' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="mt-1 text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform origin-left">{stat.count}</p>
                      </div>
                      <div className={`${stat.color} ${stat.bg} p-3 rounded-2xl group-hover:rotate-12 transition-all shadow-sm`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {renderEventList('Recently Booked', data.bookings.slice(0, 3), <Calendar className="h-4 w-4" />, 'No upcoming events.', '/members/bookings')}
                {renderEventList('Favorite Picks', data.saves.slice(0, 3), <Bookmark className="h-4 w-4" />, 'No saved events.', '/members/dashboard?tab=favorites')}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-indigo-600 pl-4">Digital Passes</h2>
              </div>
              <div className="grid gap-4">
                {data.bookings.length > 0 ? (
                  data.bookings.map((booking: DashboardBooking) => (
                    <div key={booking.id} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-2xl transition-all">
                      <div className="h-28 w-28 shrink-0 rounded-2xl overflow-hidden bg-gray-50 relative shadow-inner border border-gray-100">
                        {booking.events?.cover_image_url ? (
                          <img src={booking.events.cover_image_url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                             <Calendar className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight italic">{booking.events?.title || 'Unknown Event'}</h3>
                        <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><Calendar className="h-3 w-3" /> {isMounted && booking.events?.start_datetime ? new Date(booking.events.start_datetime).toLocaleDateString() : ''}</span>
                           <div className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                             booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                             booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                             'bg-gray-50 text-gray-600 border-gray-100'
                           }`}>
                             {booking.status}
                           </div>
                            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full">Ref: {booking.booking_ref}</span>
                         </div>
                         {booking.events?.refund_policy_text && (
                           <p className="mt-2 text-[9px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg inline-block uppercase tracking-widest">
                             Note: {booking.events.refund_policy_text}
                           </p>
                         )}
                      </div>
                      <div className="flex gap-2">
                         <Link 
                            href={`/members/tickets/${booking.booking_ref}/print`}
                            target="_blank"
                            className="px-8 py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
                         >
                             Download PDF
                          </Link>
                          {booking.events?.slug && (
                            <Link href={`/events/${booking.events.slug}`} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all">
                               <ArrowRight className="h-5 w-5" />
                            </Link>
                          )}
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No Active Tickets</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'managed' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-amber-500 pl-4 text-amber-600">Host Dashboard</h2>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95"
                  >
                    <PlusCircle className="h-4 w-4" />
                    New Host Page
                  </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {data.hostPages.length > 0 ? (
                  data.hostPages.map((page: DashboardHostPage) => {
                    const activeSub = page.subscriptions?.some((s) => s.status === 'active' && new Date(s.ends_at) > new Date())
                    return (
                      <div key={page.id} className={`bg-white rounded-[2.5rem] border ${activeSub ? 'border-gray-100' : 'border-gray-200 opacity-80 grayscale'} p-8 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden flex flex-col group`}>
                        {!activeSub && (
                          <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
                            <Crown className="h-3 w-3" />
                            Premium Locked
                          </div>
                        )}
                        
                        <div className="flex items-center gap-5 mb-8">
                           <div className="h-24 w-24 rounded-3xl bg-gray-50 overflow-hidden border border-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                             {page.logo_url && <img src={page.logo_url} className="h-full w-full object-cover" />}
                           </div>
                           <div className="flex-1 min-w-0">
                             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic truncate">{page.display_name || 'Host Page'}</h3>
                             <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest line-clamp-1">{page.tagline || 'Experience Organizer'}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                           <div className="bg-gray-50 p-5 rounded-3xl text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Impact</p>
                              <p className="text-2xl font-black text-gray-800 tracking-tight">{page.total_events_hosted || 0}</p>
                           </div>
                           <div className="bg-gray-50 p-5 rounded-3xl text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Fanbase</p>
                              <p className="text-2xl font-black text-gray-800 tracking-tight">{page.follower_count || 0}</p>
                           </div>
                           <div className="bg-gray-50 p-5 rounded-3xl text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Trust</p>
                              <p className="text-2xl font-black text-gray-800 tracking-tight">{page.rating_avg || '0.0'}</p>
                           </div>
                        </div>

                        <div className="mt-auto space-y-3">
                           {activeSub ? (
                             <Link 
                                href={`/members/host-dashboard/${page.id}`} 
                                className="block w-full text-center py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-2xl shadow-slate-200"
                             >
                               Manage Platform
                             </Link>
                           ) : (
                             <Link 
                                href={`/members/host-dashboard/create?pageId=${page.id}`} 
                                className="block w-full text-center py-5 bg-amber-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-700 transition-all active:scale-95 shadow-2xl shadow-amber-100"
                             >
                               Unlock Events
                             </Link>
                           )}
                           <Link 
                              href={`/members/host-dashboard/${page.id}/analytics`} 
                              className={`block w-full text-center py-4 bg-transparent border border-gray-100 text-gray-400 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] hover:border-gray-300 hover:text-gray-600 transition-all ${!activeSub && 'pointer-events-none opacity-20'}`}
                           >
                              Review Attendees
                           </Link>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                     <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-6">No managed platforms</p>
                     <button onClick={() => setIsCreateModalOpen(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Start Hosting</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-8">
               <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-rose-500 pl-4 text-rose-600">Your Favorites</h2>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ...data.saves.map(s => ({ ...s, type: 'Saved', icon: <Bookmark className="h-3 w-3" /> })),
                  ...data.likes.map(l => ({ ...l, type: 'Liked', icon: <Heart className="h-3 w-3" /> })),
                  ...data.interests.map(i => ({ ...i, type: 'Interested', icon: <Star className="h-3 w-3" /> }))
                ].length > 0 ? (
                  [
                    ...data.saves.map(s => ({ ...s, type: 'Saved', icon: <Bookmark className="h-3 w-3 text-amber-500" /> })),
                    ...data.likes.map(l => ({ ...l, type: 'Liked', icon: <Heart className="h-3 w-3 text-rose-500" /> })),
                    ...data.interests.map(i => ({ ...i, type: 'Interested', icon: <Star className="h-3 w-3 text-yellow-500" /> }))
                  ].map((item: DashboardInteraction & { type: string, icon: React.ReactNode }, idx) => {
                    const event = item.events
                    if (!event) return null
                    return (
                      <div key={`${item.type}-${idx}`} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-all group">
                        <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                          {event.cover_image_url ? (
                            <img src={event.cover_image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Calendar className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/events/${event.slug}`} className="truncate text-[11px] font-black text-gray-900 hover:text-indigo-600 block transition-colors uppercase italic">
                            {event.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">
                               {item.icon} {item.type}
                             </span>
                          </div>
                        </div>
                        <Link href={`/events/${event.slug}`} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                           <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Nothing here yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
             <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-slate-800 pl-4">Review History</h2>
                <div className="space-y-4">
                   {data.reviews.length > 0 ? (
                     data.reviews.map((review: DashboardReview) => (
                       <div key={review.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                          <div className="flex justify-between items-start mb-6">
                             {review.events ? (
                               <Link href={`/events/${review.events.slug}`} className="text-lg font-black text-gray-900 hover:text-indigo-600 transition-colors uppercase tracking-tight italic">{review.events.title}</Link>
                             ) : (
                               <span className="text-lg font-black text-gray-400 uppercase tracking-tight italic">Archived Event</span>
                             )}
                             <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-black text-amber-700">{review.rating}</span>
                             </div>
                          </div>
                          <p className="text-gray-500 font-medium italic leading-relaxed text-sm">"{review.review_text || 'No review text provided.'}"</p>
                          <div className="mt-6 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{isMounted && review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline focus:outline-none">Edit Review</button>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm text-center">No Reviews Shared</p>
                     </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'following' && (
             <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-rose-400 pl-4">Following</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.following.length > 0 ? (
                      data.following.map((follow: DashboardFollow) => (
                        <div key={follow.id} className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center gap-4 group hover:shadow-2xl transition-all">
                           <div className="h-16 w-16 rounded-2xl bg-gray-50 overflow-hidden shrink-0 shadow-inner border border-gray-100 group-hover:scale-105 transition-transform">
                              {follow.host_pages?.logo_url && <img src={follow.host_pages.logo_url} className="h-full w-full object-cover" />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{follow.host_pages?.display_name || 'Host Page'}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-0.5">Influencer</p>
                           </div>
                           {follow.host_pages?.slug && (
                             <Link href={`/hosts/${follow.host_pages.slug}`} className="p-3 bg-gray-50 text-gray-300 rounded-2xl group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                                <ArrowRight className="h-4 w-4" />
                             </Link>
                           )}
                        </div>
                      ))
                   ) : (
                     <div className="col-span-full py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Following List Empty</p>
                     </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-indigo-600 pl-4">Subscription & Billing</h2>
                <Link 
                  href="/members/host-dashboard/create" 
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  Upgrade Plan
                </Link>
              </div>

              <div className="grid gap-6">
                {data.hostPages.some(p => p.subscriptions && p.subscriptions.length > 0) ? (
                  data.hostPages.filter(p => p.subscriptions && p.subscriptions.length > 0).map((page: DashboardHostPage) => (
                    <div key={page.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                            {page.logo_url && <img src={page.logo_url} className="h-full w-full object-cover" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight italic">{page.display_name || 'Host Page'}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Host Platform</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Method</p>
                            <p className="text-xs font-black text-gray-900 uppercase">Razorpay Subscription</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {page.subscriptions?.map((sub) => {
                          if (!sub.ends_at) return null
                          const isExpired = new Date(sub.ends_at) < new Date()
                          const isActive = sub.status === 'active' && !isExpired
                          const daysRemaining = Math.max(0, Math.ceil((new Date(sub.ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))

                          return (
                            <div key={sub.id} className={`p-6 rounded-3xl border-2 transition-all ${isActive ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-50 bg-gray-50/30 opacity-60'}`}>
                              <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                                  {isActive ? 'Active' : isExpired ? 'Expired' : sub.status}
                                </span>
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">
                                  ₹{sub.amount}/{sub.plan_type === 'monthly' ? 'mo' : 'yr'}
                                </span>
                              </div>
                              
                              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                                {sub.plan_type === 'monthly' ? <Crown className="h-4 w-4 text-indigo-600" /> : <ShieldCheck className="h-4 w-4 text-amber-500" />}
                                {sub.plan_type} Plan
                              </h4>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                  <span className="text-gray-400 uppercase tracking-widest">Valid Until</span>
                                  <span className="text-gray-900">{isMounted && sub.ends_at ? new Date(sub.ends_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                  <span className="text-gray-400 uppercase tracking-widest">Progress</span>
                                  <span className={isActive ? 'text-emerald-600' : 'text-gray-400'}>{daysRemaining} days left</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    style={{ width: `${Math.min(100, (daysRemaining / (sub.plan_type === 'monthly' ? 30 : 365)) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                      <Clock className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-6">No Active Subscriptions Found</p>
                    <Link href="/members/host-dashboard/create" className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Choose a Plan</Link>
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] bg-slate-900 p-8 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="max-w-md">
                    <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">Need help with billing?</h3>
                    <p className="text-slate-400 text-sm font-medium">For any payment issues, refund requests, or plan changes, our support team is available 24/7 to assist you.</p>
                  </div>
                  <Link href="/contact" className="px-10 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                    Contact Support
                  </Link>
                </div>
                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab userId={userId} />
          )}

        </div>
      </main>
      <CreateHostPageModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}

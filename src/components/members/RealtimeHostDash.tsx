'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Star, Calendar, Users, Eye, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface RealtimeHostDashProps {
  userId: string
  pageId: string
  initialEvents: any[]
  initialStats: {
    totalEarnings: number
    totalBookings: number
    totalEngagement: number
    reviewCount: number
    profileViews: number
    followers: number
  }
  initialAttendees: any[]
  initialPayouts: any[]
}

export function RealtimeHostDash({ 
  userId, 
  pageId, 
  initialEvents, 
  initialStats, 
  initialAttendees, 
  initialPayouts 
}: RealtimeHostDashProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [events, setEvents] = useState(initialEvents)
  const [stats, setStats] = useState(initialStats)
  const [attendees, setAttendees] = useState(initialAttendees)
  const [payouts, setPayouts] = useState(initialPayouts)
  const [activeTab, setActiveTab] = useState<'events' | 'attendees' | 'earnings'>('events')
  const supabase = createClient()

  const refreshData = useCallback(async () => {
    // 1. Fetch updated events
    const { data: updatedEvents } = await supabase
      .from('events')
      .select('id, title, slug, status, start_datetime, booking_count, views_count, likes_count, interests_count')
      .eq('host_page_id', pageId)
      .order('start_datetime', { ascending: false })

    if (updatedEvents) {
      setEvents(updatedEvents)
      
      // 2. Recalculate stats based on updated events
      const totalBookings = updatedEvents.reduce((acc, curr) => acc + (curr.booking_count || 0), 0)
      const totalLikes = updatedEvents.reduce((acc, curr) => acc + (curr.likes_count || 0), 0)
      const totalInterests = updatedEvents.reduce((acc, curr) => acc + (curr.interests_count || 0), 0)
      
      setStats(prev => ({
        ...prev,
        totalBookings,
        totalEngagement: totalLikes + totalInterests
      }))
    }

    // 3. Fetch attendees
    const { data: updatedAttendees } = await supabase
      .from('bookings')
      .select('id, attendee_name, attendee_email, attendee_phone, booking_ref, status, created_at, event_id, events!inner(title)')
      .eq('events.host_page_id', pageId)
      .order('created_at', { ascending: false })
    
    if (updatedAttendees) {
      setAttendees(updatedAttendees)
    }

    // 4. Fetch payouts
    const { data: updatedPayouts } = await supabase
      .from('payouts')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false })
    
    if (updatedPayouts) {
      setPayouts(updatedPayouts)
      const totalEarnings = updatedPayouts.reduce((acc, curr) => acc + (parseFloat(curr.net_amount as unknown as string) || 0), 0)
      setStats(prev => ({ ...prev, totalEarnings }))
    }

    // 5. Fetch host profile for followers
    const { data: profile } = await supabase
      .from('host_pages')
      .select('follower_count')
      .eq('user_id', userId)
      .single()
    
    if (profile) {
      setStats(prev => ({
        ...prev,
        followers: profile.follower_count || 0
      }))
    }
  }, [userId, pageId, supabase])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    if (typeof window === 'undefined') return

    const eventsChannel = supabase
      .channel('host-events-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `host_id=eq.${userId}`
        },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'host_pages',
          filter: `user_id=eq.${userId}`
        },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        {
           event: '*',
           schema: 'public',
           table: 'payouts',
           filter: `host_id=eq.${userId}`
        },
        () => refreshData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(eventsChannel)
    }
  }, [userId, supabase, refreshData])

  return (
    <div className="space-y-10">
      {/* Analytics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
         <div className="group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Total Earnings</h3>
            <p className="mt-4 text-4xl font-black text-zinc-900">₹{stats.totalEarnings.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
               <span className="rounded-full bg-emerald-50 px-2 py-1">Net Payouts</span>
            </div>
         </div>
         <div className="group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Booked Spots</h3>
            <p className="mt-4 text-4xl font-black text-zinc-900">{stats.totalBookings}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600">
               <span className="rounded-full bg-indigo-50 px-2 py-1">across {events.length} events</span>
            </div>
         </div>
         <div className="group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Engagement</h3>
            <div className="mt-4 flex items-baseline gap-2">
               <p className="text-4xl font-black text-zinc-900">{stats.totalEngagement}</p>
               <span className="text-sm font-bold text-zinc-400">Likes & Interests</span>
            </div>
            <p className="mt-2 text-xs font-bold text-zinc-400">{stats.reviewCount || 0} Reviews received</p>
         </div>
         <div className="group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Profile Influence</h3>
            <p className="mt-4 text-4xl font-black text-zinc-900">{stats.profileViews}</p>
            <p className="mt-2 text-xs font-bold text-zinc-400">{stats.followers} Followers</p>
         </div>
      </div>

      {/* Tabbed Content Section */}
      <div className="rounded-[2.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden min-h-[400px]">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-50 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 min-w-[150px] px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'events' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            Manage Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('attendees')}
            className={`flex-1 min-w-[150px] px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'attendees' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            Attendee Insights ({attendees.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 min-w-[150px] px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'earnings' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            Earnings History ({payouts.length})
          </button>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'events' && (
            events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-500">
                  <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <tr>
                      <th scope="col" className="px-8 py-4">Event Details</th>
                      <th scope="col" className="px-6 py-4">Engagement</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {events.map((evt: any) => (
                      <tr key={evt.id} className="bg-white hover:bg-zinc-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900 text-lg leading-tight">{evt.title}</span>
                            <span className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-tight">
                            {isMounted ? new Date(evt.start_datetime).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex gap-4">
                              <div className="flex flex-col">
                                <span className="text-zinc-900 font-black">{evt.booking_count || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Bookings</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-zinc-900 font-black">{evt.likes_count || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Likes</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-zinc-900 font-black">{evt.interests_count || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Interests</span>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-medium">
                          <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider
                            ${evt.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 
                              evt.status === 'draft' ? 'bg-zinc-100 text-zinc-500' : 
                              'bg-amber-50 text-amber-700'}
                          `}>
                            {evt.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/events/${evt.slug}`} className="rounded-xl border border-zinc-100 px-3 py-1.5 text-xs font-black text-zinc-600 transition hover:bg-zinc-50">
                              View
                            </Link>
                            <Link href={`/members/host-dashboard/${pageId}/events/${evt.id}/edit`} className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-zinc-800 shadow-sm">
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-8 py-20 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 mb-4">
                    <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-black text-zinc-900">Your stage is waiting</h3>
                <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Create your first event and start hosting on City Culture.</p>
                <div className="mt-8">
                  <Link
                    href={`/members/host-dashboard/${pageId}/create-event`}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-indigo-600 px-8 py-2 text-sm font-black text-white transition-all hover:bg-indigo-700 shadow-md"
                  >
                    Create First Event
                  </Link>
                </div>
              </div>
            )
          )}

          {activeTab === 'attendees' && (
            attendees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-500">
                  <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <tr>
                      <th scope="col" className="px-8 py-4">Attendee Details</th>
                      <th scope="col" className="px-6 py-4">Event</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-8 py-4 text-right">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendees.map((booking: any) => (
                      <tr key={booking.id} className="bg-white hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900 text-lg leading-tight">{booking.attendee_name}</span>
                            <span className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-tight">Ref: {booking.booking_ref}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-zinc-700">
                          {booking.events?.title || 'Unknown Event'}
                        </td>
                        <td className="px-6 py-6">
                           <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 uppercase">
                              {booking.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex flex-col items-end gap-1">
                               <span className="text-xs font-black text-zinc-900">{booking.attendee_phone}</span>
                              <span className="text-[10px] font-bold text-zinc-400">{booking.attendee_email}</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-8 py-20 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 mb-4">
                    <span className="text-2xl">🎟️</span>
                </div>
                <h3 className="text-xl font-black text-zinc-900">Waiting for tickets to sell</h3>
                <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Once users start booking tickets for your events, their details will appear here.</p>
              </div>
            )
          )}

          {activeTab === 'earnings' && (
            payouts.length > 0 ? (
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-zinc-500">
                    <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                       <tr>
                          <th scope="col" className="px-8 py-4">Payout Date</th>
                          <th scope="col" className="px-6 py-4">Gross Revenue</th>
                          <th scope="col" className="px-6 py-4">Platform Fee</th>
                          <th scope="col" className="px-6 py-4">Net Payout</th>
                          <th scope="col" className="px-8 py-4 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {payouts.map((payout: any) => (
                          <tr key={payout.id} className="bg-white hover:bg-zinc-50/50 transition-colors">
                             <td className="px-8 py-6">
                                <div className="flex flex-col">
                                   <span className="font-black text-zinc-900">{new Date(payout.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">ID: {payout.id.split('-')[0]}</span>
                                </div>
                             </td>
                             <td className="px-6 py-6">
                                <span className="font-bold text-zinc-700">₹{parseFloat(payout.gross_amount).toLocaleString()}</span>
                             </td>
                             <td className="px-6 py-6 text-zinc-400">
                                ₹{(parseFloat(payout.platform_fee) + parseFloat(payout.gst_on_fee || 0)).toLocaleString()}
                             </td>
                             <td className="px-6 py-6">
                                <span className="font-black text-emerald-600">₹{parseFloat(payout.net_amount).toLocaleString()}</span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                                   payout.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                   {payout.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            ) : (
               <div className="px-8 py-20 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 mb-4">
                      <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900">No earnings yet</h3>
                  <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Complete your first event to start earning on City Culture.</p>
               </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

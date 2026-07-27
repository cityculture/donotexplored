'use client'

import { useState, useEffect } from 'react'
import { QrCode, List, ChevronLeft, Search, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CompactTicketScanner } from '@/components/members/attendance/CompactTicketScanner'
import { ManualTicketList } from '@/components/members/attendance/ManualTicketList'
import { toast } from 'sonner'

interface AttendanceTabProps {
  userId: string
}

interface EventShort {
  id: string
  title: string
  start_datetime: string
}

export function AttendanceTab({ userId }: AttendanceTabProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [events, setEvents] = useState<EventShort[]>([])
  const [mode, setMode] = useState<'auto' | 'manual' | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchHostEvents() {
      try {
        setLoading(true)
        // Fetch events where user is host or co-host
        const { data: hostEvents, error: hostError } = await supabase
          .from('events')
          .select('id, title, start_datetime')
          .eq('host_id', userId)
          .order('start_datetime', { ascending: false })

        const { data: cohostEvents, error: cohostError } = await supabase
          .from('event_cohosts')
          .select('event_id, events(id, title, start_datetime)')
          .eq('host_user_id', userId)
          .eq('is_confirmed', true)

        if (hostError || cohostError) throw hostError || cohostError

        const allEvents = [
          ...(hostEvents || []),
          ...(cohostEvents?.map(ce => ce.events as unknown as EventShort).filter(Boolean) || [])
        ]
        
        // De-duplicate
        const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values())
        setEvents(uniqueEvents)
        
        if (uniqueEvents.length === 1) {
          setSelectedEventId(uniqueEvents[0].id)
        }
      } catch (err) {
        console.error('Error fetching events:', err)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchHostEvents()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No Events Found to Manage</p>
      </div>
    )
  }

  if (!selectedEventId) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-amber-500 pl-4">Select Event</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="bg-white p-6 rounded-3xl border border-gray-100 text-left hover:shadow-xl transition-all group"
            >
              <h3 className="font-black text-gray-900 group-hover:text-amber-600 transition-colors">{event.title}</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">
                {new Date(event.start_datetime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSelectedEventId(null)
              setMode(null)
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic border-l-4 border-amber-500 pl-4">
              Attendance: {selectedEvent?.title}
            </h2>
          </div>
        </div>
      </div>

      {!mode ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <button
            onClick={() => setMode('auto')}
            className="bg-white p-12 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center gap-6 hover:shadow-2xl transition-all group"
          >
            <div className="p-6 bg-amber-50 rounded-3xl group-hover:scale-110 transition-transform">
              <QrCode className="h-12 w-12 text-amber-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Auto Checking</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Scan QR Codes via Camera</p>
            </div>
          </button>

          <button
            onClick={() => setMode('manual')}
            className="bg-white p-12 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center gap-6 hover:shadow-2xl transition-all group"
          >
            <div className="p-6 bg-indigo-50 rounded-3xl group-hover:scale-110 transition-transform">
              <List className="h-12 w-12 text-indigo-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Manual Checking</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Select from Attendee List</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              {mode === 'auto' ? <QrCode className="h-4 w-4 text-amber-500" /> : <List className="h-4 w-4 text-indigo-500" />}
              {mode === 'auto' ? 'QR Scanner' : 'Attendee List'}
            </h3>
            <button 
              onClick={() => setMode(null)}
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              Switch Mode
            </button>
          </div>

          {mode === 'auto' ? (
            <CompactTicketScanner eventId={selectedEventId} />
          ) : (
            <ManualTicketList eventId={selectedEventId} />
          )}
        </div>
      )}
    </div>
  )
}

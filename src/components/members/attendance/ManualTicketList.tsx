'use client'

import { useState, useEffect } from 'react'
import { Search, User, Phone, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { getEventTicketsAction, type TicketWithDetails } from '@/actions/attendance.actions'
import { TicketDetailView } from '@/components/members/attendance/TicketDetailView'
import { toast } from 'sonner'
import { useCallback } from 'react'

interface ManualTicketListProps {
  eventId: string
}

export function ManualTicketList({ eventId }: ManualTicketListProps) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getEventTicketsAction(eventId)
      if (result.status === 'success') {
        setTickets((result.tickets as unknown as TicketWithDetails[]) || [])
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchTickets()
  }, [eventId, fetchTickets])

  const filteredTickets = tickets.filter(t => {
    const searchLower = search.toLowerCase()
    return (
      (t.ticket_number || '').toLowerCase().includes(searchLower) ||
      (t.holder_name || '').toLowerCase().includes(searchLower) ||
      (t.bookings?.attendee_name || '').toLowerCase().includes(searchLower) ||
      (t.bookings?.attendee_phone || '').includes(search)
    )
  })

  if (selectedTicket) {
    return (
      <TicketDetailView 
        ticket={selectedTicket} 
        onComplete={() => {
          setSelectedTicket(null)
          fetchTickets() // Refresh list
        }}
        onCancel={() => setSelectedTicket(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Name, Phone, or Ticket #..."
          className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${ticket.is_checked_in ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-900 uppercase truncate">
                      {ticket.holder_name || ticket.bookings?.attendee_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">#{ticket.ticket_number}</span>
                      {ticket.bookings?.attendee_phone && (
                        <span className="text-[9px] font-bold text-gray-300 flex items-center gap-1 uppercase tracking-tighter">
                          <Phone className="h-2 w-2" /> {ticket.bookings.attendee_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  {ticket.is_checked_in ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[8px] font-black uppercase tracking-widest">
                       <CheckCircle2 className="h-3 w-3" />
                       Used
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Select</span>
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              No matching tickets found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, User, Phone, Mail, Ticket, AlertTriangle, Loader2 } from 'lucide-react'
import { processAttendanceAction, type TicketWithDetails } from '@/actions/attendance.actions'
import { toast } from 'sonner'

interface TicketDetailViewProps {
  ticket: TicketWithDetails
  onComplete: () => void
  onCancel?: () => void
}

const DENIAL_REASONS = [
  'Invalid Ticket Type',
  'Wrong Venue',
  'Underage',
  'Intoxicated',
  'Disorderly Conduct',
  'Blacklisted User',
  'Other'
]

export function TicketDetailView({ ticket, onComplete, onCancel }: TicketDetailViewProps) {
  const [loading, setLoading] = useState(false)
  const [denialReason, setDenialReason] = useState('')
  const [showDenyReason, setShowDenyReason] = useState(false)

  const handleDecision = async (status: 'allowed' | 'denied') => {
    if (status === 'denied' && !showDenyReason) {
      setShowDenyReason(true)
      return
    }

    try {
      setLoading(true)
      const result = await processAttendanceAction({
        ticketId: ticket.id,
        eventId: ticket.event_id,
        status,
        denialReason: status === 'denied' ? denialReason : undefined
      })

      if (result.status === 'success') {
        toast.success(result.message)
        onComplete()
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error('Failed to process attendance')
    } finally {
      setLoading(false)
    }
  }

  const isAlreadyCheckedIn = !!ticket.is_checked_in

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Booker Header */}
      <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
          <User className="h-8 w-8 text-indigo-500" />
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight italic">
            {ticket.holder_name || ticket.bookings?.attendee_name || 'Anonymous Attendee'}
          </h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ticket Holder</p>
        </div>
      </div>

      {isAlreadyCheckedIn && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-900 uppercase">Already Checked In</p>
            <p className="text-[10px] text-amber-700 font-bold mt-1 uppercase">
              Scanned at {ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleTimeString() : 'N/A'} by {ticket.checked_in_by === ticket.events?.host_id ? 'You' : 'Another Host'}
            </p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center">
          <Ticket className="h-4 w-4 text-gray-400 mx-auto mb-2" />
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Ticket #</p>
          <p className="text-xs font-black text-gray-900">{ticket.ticket_number}</p>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center">
          <Phone className="h-4 w-4 text-gray-400 mx-auto mb-2" />
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Phone</p>
          <p className="text-xs font-black text-gray-900">{ticket.bookings?.attendee_phone || 'Not Provided'}</p>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center col-span-2">
           <Mail className="h-4 w-4 text-gray-400 mx-auto mb-2" />
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Email</p>
           <p className="text-xs font-black text-gray-900 truncate">{ticket.holder_email || ticket.bookings?.attendee_email || 'Not Provided'}</p>
        </div>
      </div>

      {showDenyReason && (
        <div className="space-y-3 animate-in fade-in zoom-in-95">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Denial Reason</label>
          <select
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          >
            <option value="">Select a reason...</option>
            {DENIAL_REASONS.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        {!showDenyReason ? (
          <>
            <button
              onClick={() => handleDecision('allowed')}
              disabled={loading || isAlreadyCheckedIn}
              className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isAlreadyCheckedIn ? 'Checked In' : 'Allow Entry'}
            </button>
            <button
              onClick={() => handleDecision('denied')}
              disabled={loading}
              className="flex-1 py-5 bg-rose-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-100 flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Deny Entry
            </button>
          </>
        ) : (
          <>
             <button
              onClick={() => handleDecision('denied')}
              disabled={loading || !denialReason}
              className="flex-1 py-5 bg-rose-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Confirm Denial
            </button>
            <button
              onClick={() => setShowDenyReason(false)}
              disabled={loading}
              className="px-8 py-5 bg-gray-100 text-gray-500 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
          </>
        )}
      </div>
      
      {onCancel && !showDenyReason && (
         <button 
           onClick={onCancel}
           className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
         >
           Cancel Review
         </button>
      )}
    </div>
  )
}

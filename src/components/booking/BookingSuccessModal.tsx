'use client'

import React, { useState } from 'react'
import { CheckCircle2, Download, Printer, Share2, Loader2, Ticket as TicketIcon } from 'lucide-react'
// import { generateTicketPDF } from '@/lib/pdf-utils' -- removed for SSR safety
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BookingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  bookingDetails: {
    bookingRef: string
    attendeeName: string
    attendeeEmail: string
    eventTitle: string
    eventDate: string
    eventEndDate?: string
    venueName: string
    city: string
    coverImageUrl?: string
    eventSlug: string
    refundPolicyText?: string
    tickets: Array<{
      id: string
      ticketNumber: string
      tierName: string
      qrCodeData: string
    }>
  }
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  bookingDetails,
}: BookingSuccessModalProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null


  const handleDownloadSingle = async (ticket: any) => {
    setIsGenerating(true)
    const toastId = toast.loading(`Preparing ticket ${ticket.ticketNumber}...`)

    try {
      const { generateTicketPDF } = await import('@/lib/pdf-utils')
      const pdf = await generateTicketPDF({
        bookingRef: bookingDetails.bookingRef,
        eventTitle: bookingDetails.eventTitle,
        eventDate: bookingDetails.eventDate,
        eventEndDate: bookingDetails.eventEndDate,
        venueName: bookingDetails.venueName,
        city: bookingDetails.city,
        attendeeName: bookingDetails.attendeeName,
        ticketTierName: ticket.tierName,
        ticketNumber: ticket.ticketNumber,
        qrCodeData: ticket.qrCodeData,
        terms: bookingDetails.refundPolicyText,
      })

      pdf.save(`CityCulture_Ticket_${ticket.ticketNumber}.pdf`)
      toast.success(`Ticket ${ticket.ticketNumber} downloaded!`, { id: toastId })
    } catch (error) {
      console.error('Single PDF Generation Error:', error)
      toast.error('Failed to generate ticket.', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  // Refined handleDownloadAll that actually works across multiple pages
  const handleDownloadAllFixed = async () => {
    setIsGenerating(true)
    const toastId = toast.loading('Generating all tickets...')
    try {
      const { drawTicketPage, generateTicketPDF } = await import('@/lib/pdf-utils')
      
      const firstTicket = bookingDetails.tickets[0]
      const pdf = await generateTicketPDF({
        bookingRef: bookingDetails.bookingRef,
        eventTitle: bookingDetails.eventTitle,
        eventDate: bookingDetails.eventDate,
        eventEndDate: bookingDetails.eventEndDate,
        venueName: bookingDetails.venueName,
        city: bookingDetails.city,
        attendeeName: bookingDetails.attendeeName,
        ticketTierName: firstTicket.tierName,
        ticketNumber: firstTicket.ticketNumber,
        qrCodeData: firstTicket.qrCodeData,
        terms: bookingDetails.refundPolicyText,
      })

      for (let i = 1; i < bookingDetails.tickets.length; i++) {
        const ticket = bookingDetails.tickets[i]
        pdf.addPage([810, 1012], 'portrait')
        await drawTicketPage(pdf, {
          bookingRef: bookingDetails.bookingRef,
          eventTitle: bookingDetails.eventTitle,
          eventDate: bookingDetails.eventDate,
          eventEndDate: bookingDetails.eventEndDate,
          venueName: bookingDetails.venueName,
          city: bookingDetails.city,
          attendeeName: bookingDetails.attendeeName,
          ticketTierName: ticket.tierName,
          ticketNumber: ticket.ticketNumber,
          qrCodeData: ticket.qrCodeData,
          terms: bookingDetails.refundPolicyText,
        })
      }
      
      pdf.save(`CityCulture_Tickets_${bookingDetails.bookingRef}.pdf`)
      toast.success('All tickets downloaded as a single PDF!', { id: toastId })
    } catch (err) {
      console.error('Batch ZIP/PDF error:', err)
      toast.error('Error generating all tickets', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Compact Success Header */}
        <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 tracking-tight leading-none">Booking Confirmed!</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                Ref: <span className="text-zinc-900">{bookingDetails.bookingRef}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
            <div className="bg-indigo-50/50 rounded-2xl p-4 text-center border border-indigo-100/50">
               <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                 Confirmation Sent To
               </p>
               <p className="text-sm font-black text-indigo-600 truncate">
                 {bookingDetails.attendeeEmail}
               </p>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tickets ({bookingDetails.tickets.length})</h3>
                  <div className="h-px flex-1 bg-zinc-100 mx-3" />
               </div>

               <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {bookingDetails.tickets.map((ticket) => (
                    <div key={ticket.id} className="group flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-100 transition hover:border-indigo-200 hover:shadow-sm">
                       <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 truncate">{ticket.tierName}</p>
                          <p className="text-sm font-black text-zinc-900 font-mono">{ticket.ticketNumber}</p>
                       </div>
                       <button 
                         onClick={() => handleDownloadSingle(ticket)}
                         disabled={isGenerating}
                         className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50"
                         title="Download Individual Ticket"
                       >
                          <Download className="h-4 w-4" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
               <button
                 onClick={handleDownloadAllFixed}
                 disabled={isGenerating}
                 className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
               >
                 {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                 ) : (
                    <TicketIcon className="h-4 w-4" />
                 )}
                 Download All (PDF)
               </button>
               
               <button
                 onClick={() => {
                   onClose()
                   router.replace(`/events/${bookingDetails.eventSlug}`)
                 }}
                 className="w-full flex items-center justify-center bg-zinc-100 text-zinc-900 py-3 rounded-xl font-bold text-sm transition hover:bg-zinc-200"
               >
                 Done
               </button>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-zinc-400">
               <button className="flex items-center gap-1.5 text-[10px] font-bold hover:text-indigo-600 transition">
                  <Share2 className="h-3.5 w-3.5" /> Share
               </button>
               <div className="h-1 w-1 rounded-full bg-zinc-200" />
               <button className="flex items-center gap-1.5 text-[10px] font-bold hover:text-indigo-600 transition" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Print
               </button>
            </div>
        </div>
      </div>
    </div>
  )
}

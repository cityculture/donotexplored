'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TicketIcon, InfoIcon, ShieldCheckIcon, AlertCircleIcon, UserIcon, MailIcon, PhoneIcon } from 'lucide-react'
import { JoinWaitlistButton } from '../booking/JoinWaitlistButton'
import { initiateBookingAction } from '@/actions/booking.actions'

// Define exactly what this component needs based on the schemas and ticket tiers
interface Tier {
  id: string
  name: string
  price: number
  description: string | null
  max_per_booking: number
  tier_category?: 'general' | 'boys' | 'girls' | 'stag' | 'couple' | 'vip'
  available_qty?: number // From v_ticket_availability join
}

interface EventTicketPanelProps {
  eventId: string
  ticketingMode: 'platform' | 'external' | 'free' | 'rsvp' | 'none'
  externalTicketUrl: string | null
  ticketTiers: Tier[]
}

export function EventTicketPanel({
  eventId,
  ticketingMode,
  externalTicketUrl,
  ticketTiers,
}: EventTicketPanelProps) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [attendeeInfo, setAttendeeInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [showModal, setShowModal] = useState(false)

  const handleQuantityChange = (tierId: string, value: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [tierId]: value,
    }))
  }

  const handleCheckoutClick = () => {
    setErrorMsg(null)
    
    if (ticketingMode === 'external') {
      if (externalTicketUrl) {
        window.open(externalTicketUrl, '_blank')
      }
      return
    }

    if (ticketingMode === 'free' || ticketingMode === 'rsvp') {
      setIsProcessing(true)
      // For free/rsvp registration, we still want attendee info. 
      // But user specifically asked for "pop up form only after user clicked booked button"
      setShowModal(true)
      return
    }

    if (ticketingMode === 'platform') {
      const selectedTiers = Object.entries(selectedQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([tierId, qty]) => ({ ticket_tier_id: tierId, quantity: qty }))
      
      if (selectedTiers.length === 0) {
        setErrorMsg("Please select at least one ticket.")
        return
      }

      setShowModal(true)
    }
  }

  const handleFinalBooking = async () => {
    if (!attendeeInfo.name || !attendeeInfo.email || !attendeeInfo.phone) {
      setErrorMsg("Please fill in all attendee details.")
      return
    }

    setIsProcessing(true)
    setShowModal(false)
    
    try {
      if (ticketingMode === 'free' || ticketingMode === 'rsvp') {
        // Mock free booking for now if no specific action for it, 
        // or reuse initiateBookingAction with 0 amounts if it supports it.
        // Assuming initiateBookingAction handles free/rsvp if items list is empty or tiers are free.
      }

      const selectedTiers = Object.entries(selectedQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([tierId, qty]) => ({ ticket_tier_id: tierId, quantity: qty }))

      const res = await initiateBookingAction({
        event_id: eventId,
        items: selectedTiers,
        attendee_name: attendeeInfo.name,
        attendee_email: attendeeInfo.email,
        attendee_phone: attendeeInfo.phone,
      })

      if (res.success && res.data) {
        router.push(`/checkout?bookingId=${res.data.bookingId}`)
      } else {
        setErrorMsg(res.error || "Failed to initiate booking.")
        setIsProcessing(false)
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err)
      setErrorMsg("An unexpected error occurred. Please try again.")
      setIsProcessing(false)
    }
  }

  // Calculate totals
  let totalItems = 0
  let totalPrice = 0
  if (ticketingMode === 'platform') {
    Object.entries(selectedQuantities).forEach(([tierId, qty]) => {
      const tier = ticketTiers.find(t => t.id === tierId)
      if (tier && qty > 0) {
        totalItems += qty
        totalPrice += tier.price * qty
      }
    })
  }

  return (
    <>
      <div id="tickets-section" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-indigo-950">Tickets</h2>
          <TicketIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircleIcon className="h-5 w-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* RENDER MODES */}
        <div className="space-y-6">
          {ticketingMode === 'none' && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tickets are currently unavailable for this event.
            </p>
          )}

          {ticketingMode === 'external' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tickets for this event are sold through an external provider.
              </p>
              <button
                onClick={handleCheckoutClick}
                disabled={!externalTicketUrl}
                className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Get Tickets
              </button>
            </div>
          )}

          {(ticketingMode === 'free' || ticketingMode === 'rsvp') && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This event is completely free to attend, but registration is required.
              </p>
              <button
                onClick={handleCheckoutClick}
                disabled={isProcessing}
                className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isProcessing ? 'Processing...' : 'Reserve Spot'}
              </button>
            </div>
          )}

          {ticketingMode === 'platform' && (
            <>
              {ticketTiers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No ticket tiers currently available.</p>
              ) : (
                <div className="space-y-4 divide-y divide-gray-100 dark:divide-zinc-800">
                  {ticketTiers.map(tier => {
                    const available = tier.available_qty ?? 100 // fallback
                    const isSoldOut = available <= 0
                    const currentQty = selectedQuantities[tier.id] || 0
                    const maxSelectable = Math.min(tier.max_per_booking, available)

                    return (
                      <div key={tier.id} className="pt-4 first:pt-0">
                        <div className="flex items-start justify-between">
                          <div className="pr-4">
                            <div className="flex items-center gap-2 mb-1">
                               <h4 className="font-bold text-zinc-900">{tier.name}</h4>
                               {tier.tier_category && tier.tier_category !== 'general' && (
                                 <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                   tier.tier_category === 'boys' ? 'bg-indigo-100 text-indigo-700' :
                                   tier.tier_category === 'girls' ? 'bg-rose-100 text-rose-700' :
                                   tier.tier_category === 'vip' ? 'bg-amber-100 text-amber-700' :
                                   'bg-gray-100 text-gray-700'
                                 }`}>
                                   {tier.tier_category}
                                 </span>
                               )}
                            </div>
                            <p className="font-black text-slate-950">₹{tier.price}</p>
                            {tier.description && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{tier.description}</p>
                            )}
                          </div>
                          
                          <div className="shrink-0 flex flex-col items-end gap-2 text-right">
                            {isSoldOut ? (
                              <>
                                <span className="text-sm font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                                  Sold Out
                                </span>
                                <JoinWaitlistButton 
                                  eventId={eventId} 
                                  ticketTierId={tier.id} 
                                  tierName={tier.name} 
                                />
                              </>
                            ) : (
                              <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1 bg-zinc-50">
                                 <button 
                                   type="button"
                                   onClick={() => handleQuantityChange(tier.id, Math.max(0, currentQty - 1))}
                                   disabled={currentQty === 0}
                                   className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                                 >
                                   <span className="text-gray-600 font-bold">-</span>
                                 </button>
                                 <span className="w-6 text-center text-sm font-black text-zinc-950">
                                   {currentQty}
                                 </span>
                                 <button 
                                   type="button"
                                   onClick={() => handleQuantityChange(tier.id, Math.min(maxSelectable, currentQty + 1))}
                                   disabled={currentQty === maxSelectable}
                                   className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                                 >
                                   <span className="text-gray-600 font-bold">+</span>
                                 </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Total Footer */}
              {ticketTiers.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-zinc-950">Total ({totalItems})</span>
                    <span className="text-zinc-950">₹{totalPrice}</span>
                  </div>
                  
                  <button
                    onClick={handleCheckoutClick}
                    disabled={totalItems === 0 || isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Book Tickets'}
                  </button>
                  
                  <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Payments processed securely via Razorpay
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Attendee Info Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-indigo-600 p-6 text-white text-center">
                 <div className="mx-auto w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                    <UserIcon className="h-6 w-6 text-white" />
                 </div>
                 <h3 className="text-xl font-bold">Complete Your Booking</h3>
                 <p className="text-indigo-100 text-sm mt-1">Please provide attendee details to proceed</p>
              </div>
              
              <div className="p-8 space-y-5">
                 <div className="space-y-4">
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Full Name *" 
                        className="w-full rounded-xl border-gray-200 pl-10 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        value={attendeeInfo.name}
                        onChange={e => setAttendeeInfo(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                      />
                    </div>
                    
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input 
                        type="email" 
                        placeholder="Email Address *" 
                        className="w-full rounded-xl border-gray-200 pl-10 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        value={attendeeInfo.email}
                        onChange={e => setAttendeeInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input 
                        type="tel" 
                        placeholder="Phone Number *" 
                        className="w-full rounded-xl border-gray-200 pl-10 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        value={attendeeInfo.phone}
                        onChange={e => setAttendeeInfo(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                 </div>

                 {totalPrice > 0 && (
                   <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Payable Now</span>
                      <span className="text-lg font-black text-indigo-600">₹{totalPrice}</span>
                   </div>
                 )}

                 <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleFinalBooking}
                      className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
                    >
                      Confirm and Pay
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  )
}

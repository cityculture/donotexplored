'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelBookingAction } from '@/actions/booking.actions'
import { toast } from 'sonner'
import { Loader2, XCircle } from 'lucide-react'

interface CancelBookingButtonProps {
  bookingRef: string
  eventName: string
  refundAmount: number
}

export function CancelBookingButton({ bookingRef, eventName, refundAmount }: CancelBookingButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    if (!window.confirm(`Are you sure you want to cancel your booking for ${eventName}?${refundAmount > 0 ? `\n\nA full refund of ₹${refundAmount} will be initiated.` : ''}\n\nThis action cannot be undone.`)) {
      return
    }

    setIsPending(true)
    try {
      const result = await cancelBookingAction(bookingRef)
      if (result.success) {
        toast.success('Booking cancelled successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to cancel booking')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleCancel}
      className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
      disabled={isPending}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      Cancel Booking
    </button>
  )
}

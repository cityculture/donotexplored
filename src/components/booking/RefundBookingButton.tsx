'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { requestRefundAction } from '@/actions/refund.actions'

interface RefundBookingButtonProps {
  bookingRef: string
  eventName: string
  refundPolicyText?: string
}

export function RefundBookingButton({ bookingRef, eventName, refundPolicyText }: RefundBookingButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  async function handleRefund() {
    if (!confirm(`Are you sure you want to request a refund for ${eventName}? \n\nPolicy: ${refundPolicyText || 'Standard refund policy'}`)) return

    setIsProcessing(true)
    const res = await requestRefundAction(bookingRef, 'User requested refund via dashboard')
    setIsProcessing(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Refund processed successfully!')
      router.refresh()
    }
  }

  return (
    <button 
      onClick={handleRefund}
      disabled={isProcessing}
      className="flex items-center gap-2 rounded-xl bg-orange-100 px-6 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-200 disabled:opacity-50"
    >
      {isProcessing ? 'Processing Refund...' : 'Request Refund'}
    </button>
  )
}

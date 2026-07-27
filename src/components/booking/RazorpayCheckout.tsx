'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPaymentAction } from '@/actions/booking.actions'
import { toast } from 'sonner'
import { CreditCard, Loader2 } from 'lucide-react'
import Script from 'next/script'

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayCheckoutProps {
  razorpayOrderId: string
  totalAmount: number
  bookingRef: string
  keyId: string
  attendeeName: string
  attendeeEmail: string
  eventTitle: string
  eventSlug: string
  expiresAt: string
}

export function RazorpayCheckout({
  razorpayOrderId,
  totalAmount,
  bookingRef,
  keyId,
  attendeeName,
  attendeeEmail,
  eventTitle,
  eventSlug,
  expiresAt,
}: RazorpayCheckoutProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // 1. Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      // Fix: Ensure expiry is correctly interpreted as UTC
      const expiry = new Date(expiresAt.includes('Z') ? expiresAt : `${expiresAt}Z`).getTime()
      const distance = expiry - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft('EXPIRED')
        router.refresh() // Trigger server-side expired state
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, router])

  const handlePayment = useCallback(async () => {
    if (timeLeft === 'EXPIRED') {
      toast.error('Booking has expired. Please start over.')
      return
    }

    if (!scriptLoaded && !(window as unknown as { Razorpay: unknown }).Razorpay) {
      toast.error('Payment gateway is still loading. Please wait a moment.')
      return
    }

    setIsProcessing(true)

    try {
      const options = {
        key: keyId,
        amount: Math.round(Number(totalAmount) * 100),
        currency: 'INR',
        name: 'City Culture',
        description: eventTitle,
        order_id: razorpayOrderId,
        prefill: {
          name: attendeeName,
          email: attendeeEmail,
        },
        theme: {
          color: '#4F46E5',
        },
        handler: async function (response: RazorpayResponse) {
          try {
            const result = await verifyPaymentAction({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingRef,
            })

            if (result.success) {
              toast.success('Payment successful! Redirecting...')
              // Redirect back to event page with success flag and ref
              router.push(`/events/${eventSlug}?booking=success&ref=${bookingRef}`)
            } else {
              toast.error(result.error || 'Payment verification failed.')
              setIsProcessing(false)
            }
          } catch (error) {
            toast.error('An error occurred during verification.')
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          },
        },
      }

      const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      console.error('Razorpay Error:', err)
      toast.error('Could not initialize payment gateway.')
      setIsProcessing(false)
    }
  }, [keyId, totalAmount, eventTitle, eventSlug, razorpayOrderId, attendeeName, attendeeEmail, bookingRef, router, timeLeft, scriptLoaded])

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => {
          console.log('✅ Razorpay Script Loaded')
          setScriptLoaded(true)
        }}
        onError={(e) => {
          console.error('❌ Razorpay Script Failed to Load', e)
          toast.error('Failed to load payment gateway. Please check your connection or CSP.')
        }}
      />
      
      <button
        onClick={handlePayment}
        disabled={isProcessing || timeLeft === 'EXPIRED'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-center text-lg font-bold text-white transition hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : timeLeft === 'EXPIRED' ? (
          'Order Expired'
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Pay Now (₹{Number(totalAmount).toLocaleString()})
          </>
        )}
      </button>

      {timeLeft !== 'EXPIRED' && (
        <p className="mt-4 text-center text-sm font-medium text-zinc-500">
           Seconds remaining: <span className="font-bold text-orange-600">{timeLeft}</span>
        </p>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const BookingSuccessModal = dynamic(
  () => import('./BookingSuccessModal').then(mod => mod.BookingSuccessModal),
  { ssr: false }
)

interface BookingSuccessWrapperProps {
  bookingDetails: any // Matches BookingSuccessModal's bookingDetails type
}

export function BookingSuccessWrapper({ bookingDetails }: BookingSuccessWrapperProps) {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  const handleClose = () => {
    setIsOpen(false)
    // Clean up URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('booking')
    url.searchParams.delete('ref')
    router.replace(url.pathname, { scroll: false })
  }

  if (!isOpen) return null

  return (
    <BookingSuccessModal
      isOpen={isOpen}
      onClose={handleClose}
      bookingDetails={bookingDetails}
    />
  )
}

'use client'

import { useEffect } from 'react'

export function PrintTrigger() {
  useEffect(() => {
    // Wait a bit for QR codes to render
    const timer = setTimeout(() => {
      window.print()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return null
}

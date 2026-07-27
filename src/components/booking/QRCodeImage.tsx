'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Loader2 } from 'lucide-react'

interface QRCodeImageProps {
  data: string
  size?: number
}

export function QRCodeImage({ data, size = 150 }: QRCodeImageProps) {
  const [qrUrl, setQrUrl] = useState<string>('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!data) return

    QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => {
        console.error('QR Generate Error:', err)
        setError(true)
      })
  }, [data, size])

  if (error) {
    return <div className="flex h-32 w-32 items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400">Failed to load QR</div>
  }

  if (!qrUrl) {
    return (
      <div className="flex animate-pulse items-center justify-center bg-zinc-100" style={{ width: size, height: size }}>
        <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
      </div>
    )
  }

  return (
    <img 
      src={qrUrl} 
      alt="Ticket QR Code" 
      width={size} 
      height={size} 
      className="rounded-lg shadow-sm"
    />
  )
}

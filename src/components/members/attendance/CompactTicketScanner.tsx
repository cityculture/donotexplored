'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { TicketDetailView } from '@/components/members/attendance/TicketDetailView'
import { getTicketDetailsAction, type TicketWithDetails } from '@/actions/attendance.actions'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { Search, Loader2, Camera, Keyboard } from 'lucide-react'

interface CompactTicketScannerProps {
  eventId: string
}

export function CompactTicketScanner({ eventId }: CompactTicketScannerProps) {
  const [scanning, setScanning] = useState(true)
  const [scannedTicket, setScannedTicket] = useState<TicketWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [entryMode, setEntryMode] = useState<'camera' | 'manual'>('camera')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const onScanSuccess = useCallback(async (decodedText: string) => {
    if (loading) return
    
    try {
      setLoading(true)
      // Stop scanning while processing
      if (scannerRef.current) {
        await scannerRef.current.pause(true)
      }

      const result = await getTicketDetailsAction(decodedText, eventId, 'qr')
      
      if (result.status === 'success' || result.status === 'already_checked_in') {
        setScannedTicket(result.ticket || null)
      } else {
        toast.error(result.message || 'Invalid Ticket')
        if (scannerRef.current) {
          scannerRef.current.resume()
        }
      }
    } catch (err) {
      toast.error('Scanning error')
      if (scannerRef.current) {
        scannerRef.current.resume()
      }
    } finally {
      setLoading(false)
    }
  }, [loading, eventId])

  function onScanFailure(_error: unknown) {
    // Silently ignore normal scan failures (e.g. no QR in frame)
  }

  useEffect(() => {
    if (scanning && entryMode === 'camera' && !scannedTicket) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )

      scannerRef.current.render(onScanSuccess, onScanFailure)
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(_err => console.error('Failed to clear scanner'))
      }
    }
  }, [scanning, entryMode, scannedTicket, onScanSuccess])

  const handleManualLookup = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!manualInput) return

    try {
      setLoading(true)
      const result = await getTicketDetailsAction(manualInput, eventId, 'manual')
      
      if (result.status === 'success' || result.status === 'already_checked_in') {
        setScannedTicket(result.ticket || null)
      } else {
        toast.error(result.message || 'Ticket not found')
      }
    } catch (err) {
      toast.error('Lookup error')
    } finally {
      setLoading(false)
    }
  }

  const resetScanner = () => {
    setScannedTicket(null)
    setManualInput('')
    setScanning(true)
  }

  if (scannedTicket) {
    return (
      <TicketDetailView 
        ticket={scannedTicket} 
        onComplete={resetScanner} 
        onCancel={resetScanner}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => setEntryMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === 'camera' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Camera className="h-4 w-4" />
          Camera
        </button>
        <button
          onClick={() => setEntryMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Keyboard className="h-4 w-4" />
          Ticket ID
        </button>
      </div>

      {entryMode === 'camera' ? (
        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-gray-100 bg-gray-950 aspect-square max-w-sm mx-auto">
          <div id="qr-reader" className="w-full h-full"></div>
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-sm mx-auto space-y-4">
          <form onSubmit={handleManualLookup} className="relative">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter Ticket ID (e.g. TKT-XXXX)"
              className="w-full p-6 pr-16 rounded-[2rem] bg-gray-50 border border-gray-100 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all uppercase placeholder:normal-case"
            />
            <button
              type="submit"
              disabled={loading || !manualInput}
              className="absolute right-2 top-2 p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </button>
          </form>
          <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Type the full ticket ID found on the digital pass
          </p>
        </div>
      )}
    </div>
  )
}

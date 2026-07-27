'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode'
import { verifyTicketAction, checkInByTicketNumberAction, getEventCheckInStatsAction } from '@/actions/checkin.actions'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, AlertCircle, Camera, Search, QrCode, X } from 'lucide-react'

interface CheckInScannerProps {
  eventId: string
  eventTitle: string
}

export default function CheckInScanner({ eventId, eventTitle }: CheckInScannerProps) {
  const [lastResult, setLastResult] = useState<{
    status: 'success' | 'already_checked_in' | 'invalid' | 'error'
    message?: string
    holder_name?: string | null
    ticket_number?: string
    checked_in_at?: string | null
  } | null>(null)
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualTicket, setManualTicket] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrRef = useRef<HTMLDivElement | null>(null)

  const fetchStats = async () => {
    const s = await getEventCheckInStatsAction(eventId)
    setStats(s)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  async function onScanSuccess(decodedText: string) {
    if (isProcessing) return
    setIsProcessing(true)
    
    // Play a sound or vibrate if possible
    if (navigator.vibrate) navigator.vibrate(100)

    const result = await verifyTicketAction(decodedText, eventId)
    setLastResult(result)
    setIsProcessing(false)
    
    if (result.status === 'success') {
      toast.success(`Check-in successful: ${result.holder_name}`)
      fetchStats()
    } else if (result.status === 'already_checked_in') {
      toast.warning(`Ticket already checked in`)
    } else {
      toast.error(result.message || 'Verification failed')
    }
  }

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (e) {
        console.error("Stop error:", e)
      }
    }
    setIsScanning(false)
  }, [])

  const startScanning = useCallback(async () => {
    if (!qrRef.current) return
    
    setIsScanning(true)
    setError(null)
    
    try {
      const scanner = new Html5Qrcode(qrRef.current.id)
      scannerRef.current = scanner

      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      }

      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScanSuccess(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Subtle errors are usually just "no QR code found in frame"
          if (errorMessage.includes("No MultiFormat Readers were able to decode the image")) return
          console.debug("QR Error:", errorMessage)
        }
      )
    } catch (err: any) {
      console.error("Scanner error:", err)
      setError(err.message || "Could not start camera. Please ensure camera permissions are granted.")
      setIsScanning(false)
    }
  }, [onScanSuccess, stopScanning])

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTicket || isProcessing) return
    
    setIsProcessing(true)
    const result = await checkInByTicketNumberAction(manualTicket, eventId)
    setLastResult(result)
    setIsProcessing(false)
    setManualTicket('')

    if (result.status === 'success') {
      toast.success(`Check-in successful: ${result.holder_name}`)
      fetchStats()
    } else if (result.status === 'already_checked_in') {
      toast.warning(`Ticket already checked in`)
    } else {
      toast.error(result.message || 'Verification failed')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm overflow-hidden relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{eventTitle}</h1>
            <p className="text-sm text-zinc-500">Event Check-in Console</p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl text-center">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.checkedIn}</span>
            <span className="text-zinc-500 mx-1">/</span>
            <span className="text-zinc-500 font-medium">{stats.total}</span>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Checked In</div>
          </div>
        </div>

        {/* QR Reader Area */}
        <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-[2rem] bg-zinc-900 border-4 border-zinc-100 dark:border-zinc-800 shadow-2xl">
          <div id="qr-reader" ref={qrRef} className="h-full w-full" />
          
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 p-8 text-center backdrop-blur-sm">
              <div className="mb-6 rounded-full bg-indigo-500/20 p-6">
                 <QrCode className="h-12 w-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Ready to Scan?</h3>
              <p className="text-zinc-400 text-sm mb-8">Click below to activate your camera and scan attendee tickets.</p>
              <button 
                onClick={startScanning}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
              >
                <Camera className="h-5 w-5" />
                Open Camera Scanner
              </button>
            </div>
          )}

          {isScanning && (
             <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={stopScanning}
                  className="rounded-xl bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/30 transition-all"
                >
                   <X className="h-5 w-5" />
                </button>
             </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center z-10 backdrop-blur-[2px]">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 p-6 text-red-700 border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Manual Entry Fallback */}
        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <form onSubmit={handleManualCheckIn} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Enter ticket number manually..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={manualTicket}
                onChange={(e) => setManualTicket(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !manualTicket}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all"
            >
              Verify
            </button>
          </form>
        </div>
      </div>

      {/* Results Display */}
      {lastResult && (
        <div className={`rounded-2xl p-6 border animate-in fade-in slide-in-from-top-4 duration-300 ${
          lastResult.status === 'success' 
            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' 
            : lastResult.status === 'already_checked_in'
            ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
            : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              lastResult.status === 'success' 
                ? 'bg-emerald-100 text-emerald-600' 
                : lastResult.status === 'already_checked_in'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-rose-100 text-rose-600'
            }`}>
              {lastResult.status === 'success' ? <CheckCircle className="w-6 h-6" /> : 
               lastResult.status === 'already_checked_in' ? <AlertCircle className="w-6 h-6" /> : 
               <XCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${
                lastResult.status === 'success' ? 'text-emerald-900 dark:text-emerald-400' :
                lastResult.status === 'already_checked_in' ? 'text-amber-900 dark:text-amber-400' :
                'text-rose-900 dark:text-rose-400'
              }`}>
                {lastResult.status === 'success' ? 'Valid Ticket' : 
                 lastResult.status === 'already_checked_in' ? 'Already Checked In' :
                 'Invalid Ticket'}
              </h3>
              
              {lastResult.holder_name && (
                <div className="mt-2 text-zinc-700 dark:text-zinc-300">
                  <span className="text-zinc-500 font-medium">Attendee: </span>
                  <span className="font-bold">{lastResult.holder_name}</span>
                </div>
              )}
              
              {lastResult.ticket_number && (
                <div className="text-zinc-700 dark:text-zinc-300">
                  <span className="text-zinc-500 font-medium">Ticket: </span>
                  <code>{lastResult.ticket_number}</code>
                </div>
              )}

              {lastResult.checked_in_at && (
                <div className="text-zinc-700 dark:text-zinc-300">
                  <span className="text-zinc-500 font-medium">First Scanned: </span>
                  <span>{new Date(lastResult.checked_in_at).toLocaleString()}</span>
                </div>
              )}

              {lastResult.message && (
                <p className="mt-2 text-sm opacity-80">{lastResult.message}</p>
              )}
            </div>
            <button 
              onClick={() => setLastResult(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

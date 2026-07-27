'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { triggerAnalyticsSnapshotAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SnapshotButton({ lastSnapshotDate }: { lastSnapshotDate?: string }) {
  const [loading, setLoading] = useState(false)

  const handleTrigger = async () => {
    if (!window.confirm('Trigger immediate analytics snapshot for yesterday?')) return
    
    setLoading(true)
    try {
      const result = await triggerAnalyticsSnapshotAction(1) // Snapshot for yesterday
      if (result.success) {
        toast.success(`Snapshot generated for ${result.date}`)
      } else {
        toast.error(result.error || 'Snapshot failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleTrigger}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-gray-100 hover:border-indigo-100 hover:text-indigo-600 active:scale-95 shadow-sm",
        loading ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white"
      )}
    >
      <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
      {loading ? 'GENERATING...' : 'TRIGGER SNAPSHOT'}
    </button>
  )
}

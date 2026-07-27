'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { processPayoutAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle } from 'lucide-react'
import AdminModal from './AdminModal'

export default function PayoutActionButton({ 
  payoutId,
  children,
  variant,
  className
}: { 
  payoutId: string, 
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost' | 'danger',
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [done, setDone] = useState(false)

  const handleAction = async () => {
    setModalOpen(true)
  }

  const confirmPayout = async () => {
    setLoading(true)
    try {
      const result = await processPayoutAction(payoutId)
      if (result.success) {
        toast.success(`Settlement processed successfully`)
        setDone(true)
        setModalOpen(false)
      } else {
        toast.error(result.error || 'Action failed')
      }
    } catch (error) {
      toast.error('An error occurred during payout processing')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-end gap-1.5 text-xs font-black text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
        <CheckCircle className="w-4 h-4" />
        SETTLED
      </div>
    )
  }

  return (
    <>
      <Button 
        size="sm" 
        variant={variant} 
        onClick={handleAction} 
        disabled={loading}
        className={className}
      >
        {children}
      </Button>

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Execute Settlement"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
             <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Financial Disclosure</p>
                <p className="text-sm text-amber-800 font-medium italic leading-relaxed">
                  Processing this settlement will trigger a fund transfer request via Razorpay. This action is irreversible once initiated.
                </p>
             </div>
          </div>

          <p className="text-gray-600 font-medium leading-relaxed italic px-2">
            Proceed with settlement for ID: <span className="font-black text-gray-950 not-italic uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">{payoutId.substring(0, 8)}...</span>?
          </p>
          
          <div className="flex items-center justify-between gap-6 pt-4">
            <button 
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-colors"
            >
              Cancel
            </button>
            <Button 
              onClick={confirmPayout}
              disabled={loading}
              className="bg-gray-950 hover:bg-indigo-600 text-white px-8 py-6 rounded-2xl font-black italic tracking-tight transition-all shadow-xl hover:shadow-indigo-100"
            >
              {loading ? 'INITIATING...' : 'CONFIRM SETTLEMENT'}
            </Button>
          </div>
        </div>
      </AdminModal>
    </>
  )
}

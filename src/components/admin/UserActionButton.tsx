'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { suspendUserAction, unsuspendUserAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import AdminModal from './AdminModal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function UserActionButton({ 
  userId, 
  action, 
  children,
  variant,
  className
}: { 
  userId: string, 
  action: 'suspend' | 'unsuspend', 
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost' | 'danger',
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [until, setUntil] = useState('')

  const handleAction = async () => {
    if (action === 'unsuspend') {
       if (!window.confirm('Are you sure you want to unsuspend this user?')) return
       setLoading(true)
       try {
         const result = await unsuspendUserAction(userId)
         if (result.success) {
           toast.success('User unsuspended')
         } else {
           toast.error(result.error || 'Failed to unsuspend')
         }
       } catch (error) {
         toast.error('An error occurred')
       } finally {
         setLoading(false)
       }
       return
    }

    setModalOpen(true)
  }

  const confirmSuspension = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await suspendUserAction(userId, reason || 'No reason provided', until || undefined)
      if (result?.success) {
        toast.success('User suspended')
        setModalOpen(false)
      } else {
        toast.error(result?.error || 'Action failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
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
        title="Suspend User"
      >
        <form onSubmit={confirmSuspension} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reason for Suspension</label>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this user is being suspended..."
              required
              className="rounded-2xl border-gray-100 focus:ring-red-500/10 min-h-[100px] font-bold italic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Suspend Until (Optional)</label>
            <Input 
              type="date"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="rounded-2xl border-gray-100 focus:ring-red-500/10 h-12 font-bold italic"
            />
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter px-1">Leave empty for a permanent suspension.</p>
          </div>

          <div className="flex items-center justify-between gap-6 pt-4">
            <button 
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-colors"
            >
              Cancel
            </button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-red-600 hover:bg-gray-950 text-white px-8 py-6 rounded-2xl font-black italic tracking-tight transition-all shadow-xl shadow-red-100"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM SUSPENSION'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </>
  )
}

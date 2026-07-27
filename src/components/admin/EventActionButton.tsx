'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { suspendEventAction, unsuspendEventAction, approveEventAction, toggleFeaturedEvent } from '@/actions/admin.actions'
import { toast } from 'sonner'
import AdminModal from './AdminModal'
import { Textarea } from '@/components/ui/textarea'

export default function EventActionButton({ 
  eventId, 
  action, 
  value,
  children,
  variant,
  className
}: { 
  eventId: string, 
  action: 'suspend' | 'unsuspend' | 'approve' | 'feature', 
  value?: boolean,
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost' | 'danger',
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [reason, setReason] = useState('')

  const handleAction = async () => {
    if (action === 'approve') {
       if (!window.confirm('Approve and publish this event?')) return
       setLoading(true)
       try {
         const result = await approveEventAction(eventId)
         if (result.success) toast.success('Event approved')
         else toast.error(result.error || 'Failed to approve')
       } catch (error) {
         toast.error('An error occurred')
       } finally {
         setLoading(false)
       }
       return
    }

    if (action === 'unsuspend') {
      if (!window.confirm('Unsuspend this event? It will be visible again if published.')) return
      setLoading(true)
      try {
        const result = await unsuspendEventAction(eventId)
        if (result.success) toast.success('Event unsuspended')
        else toast.error(result.error || 'Failed to unsuspend')
      } catch (error) {
        toast.error('An error occurred')
      } finally {
        setLoading(false)
      }
      return
    }

    if (action === 'feature') {
      setLoading(true)
      try {
        const result = await toggleFeaturedEvent(eventId, !!value)
        if (result.success) toast.success(value ? 'Event featured' : 'Event unfeatured')
        else toast.error(result.error || 'Failed to update')
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
      const result = await suspendEventAction(eventId, reason || 'No reason provided')
      if (result?.success) {
        toast.success('Event suspended')
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
        title="Suspend Event"
      >
        <form onSubmit={confirmSuspension} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reason for Suspension</label>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you suspending this event?"
              required
              className="rounded-2xl border-gray-100 focus:ring-red-500/10 min-h-[100px] font-bold italic"
            />
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

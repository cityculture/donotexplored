'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { resolveReportAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import AdminModal from './AdminModal'
import { Textarea } from '@/components/ui/textarea'

export default function ReportActionButton({ 
  reportId, 
  status, 
  children,
  variant,
  className
}: { 
  reportId: string, 
  status: 'resolved' | 'dismissed', 
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost' | 'danger',
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [note, setNote] = useState('')

  const handleAction = async () => {
    if (status === 'dismissed') {
       if (!window.confirm('Dismiss this report as invalid?')) return
       setLoading(true)
       try {
         const result = await resolveReportAction(reportId, 'dismissed', 'Dismissed by admin')
         if (result.success) toast.success('Report dismissed')
         else toast.error(result.error || 'Failed to dismiss')
       } catch (error) {
         toast.error('An error occurred')
       } finally {
         setLoading(false)
       }
       return
    }

    setModalOpen(true)
  }

  const confirmResolution = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await resolveReportAction(reportId, 'resolved', note || 'Resolved by admin')
      if (result.success) {
        toast.success('Report resolved')
        setModalOpen(false)
      } else {
        toast.error(result.error || 'Action failed')
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
        title="Resolve Report"
      >
        <form onSubmit={confirmResolution} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Resolution Note</label>
            <Textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what action was taken..."
              required
              className="rounded-2xl border-gray-100 focus:ring-indigo-500/10 min-h-[100px] font-bold italic"
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
              className="bg-indigo-600 hover:bg-gray-950 text-white px-8 py-6 rounded-2xl font-black italic tracking-tight transition-all shadow-xl shadow-indigo-100"
            >
              {loading ? 'PROCESSING...' : 'MARK AS RESOLVED'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { approveHostAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import AdminModal from './AdminModal'

export default function HostActionButton({ 
  hostId, 
  approved, 
  variant, 
  children,
  className
}: { 
  hostId: string, 
  approved: boolean, 
  variant?: 'default' | 'outline' | 'ghost' | 'danger', 
  children: React.ReactNode,
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  const handleAction = async () => {
    setModalOpen(true)
  }

  const confirmAction = async () => {
    setLoading(true)
    try {
      const result = await approveHostAction(hostId, approved)
      if (result.success) {
        toast.success(approved ? 'Host approved' : 'Host approval revoked')
        setModalOpen(false)
        router.refresh()
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
        title={approved ? "Approve Host" : "Revoke Approval"}
      >
        <div className="space-y-6">
          <p className="text-gray-600 font-medium leading-relaxed italic">
            {approved 
              ? "You are about to approve this host. They will be able to publish events and access organiser features." 
              : "Are you sure you want to revoke approval for this host? They will no longer be able to manage events."
            }
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
              onClick={confirmAction}
              disabled={loading}
              className={approved 
                ? "bg-indigo-600 hover:bg-gray-950 text-white px-8 py-6 rounded-2xl font-black italic tracking-tight transition-all shadow-xl shadow-indigo-100"
                : "bg-red-600 hover:bg-gray-950 text-white px-8 py-6 rounded-2xl font-black italic tracking-tight transition-all shadow-xl shadow-red-100"
              }
            >
              {loading ? 'PROCESSING...' : (approved ? 'CONFIRM APPROVAL' : 'REVOKE APPROVAL')}
            </Button>
          </div>
        </div>
      </AdminModal>
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { verifyHostAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import { ShieldCheck, ShieldAlert } from 'lucide-react'

export default function VerifyHostButton({ 
  hostId, 
  isVerified, 
  className
}: { 
  hostId: string, 
  isVerified: boolean, 
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async () => {
    setLoading(true)
    try {
      const result = await verifyHostAction(hostId, !isVerified)
      if (result.success) {
        toast.success(!isVerified ? 'Host verified successfully' : 'Host verification removed')
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
    <Button 
      size="sm" 
      variant={isVerified ? "outline" : "default"} 
      onClick={handleAction} 
      disabled={loading}
      className={className}
    >
      {isVerified ? (
        <div className="flex items-center gap-1.5 text-xs font-black">
          <ShieldAlert className="w-3.5 h-3.5" />
          UNVERIFY
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-black">
          <ShieldCheck className="w-3.5 h-3.5" />
          VERIFY
        </div>
      )}
    </Button>
  )
}

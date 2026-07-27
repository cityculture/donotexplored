'use client'

import { useState } from 'react'
import { joinWaitlistAction } from '@/actions/booking.actions'
import { toast } from 'sonner'
import { Loader2, Users } from 'lucide-react'

interface JoinWaitlistButtonProps {
  eventId: string
  ticketTierId: string
  tierName: string
}

export function JoinWaitlistButton({ eventId, ticketTierId, tierName }: JoinWaitlistButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function handleJoin() {
    setIsPending(true)
    try {
      const result = await joinWaitlistAction(eventId, ticketTierId)
      if (result.success) {
        if (result.alreadyJoined) {
          toast.info(`You are already on the waitlist for ${tierName}`)
        } else {
          toast.success(`Joined waitlist for ${tierName}!`)
        }
        setPosition(result.position ?? null)
        setStatus(result.status ?? null)
      } else {
        toast.error(result.error || 'Failed to join waitlist')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsPending(false)
    }
  }

  if (status === 'waiting' || position) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Position #{position}</span>
        <span className="text-[10px] font-bold text-zinc-400">On Waitlist</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Users className="h-3 w-3" />}
      Join Waitlist
    </button>
  )
}

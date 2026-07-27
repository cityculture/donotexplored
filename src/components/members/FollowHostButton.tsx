'use client'

import { useState, useTransition } from 'react'
import { toggleHostFollow } from '@/actions/social.actions'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FollowHostButtonProps {
  hostId: string
  initialIsFollowing: boolean
}

export function FollowHostButton({ hostId, initialIsFollowing }: FollowHostButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggle = async () => {
    startTransition(async () => {
      const result = await toggleHostFollow(hostId)
      if (result.success) {
        setIsFollowing(result.action === 'followed')
        router.refresh()
      } else if (result.error && result.error.includes('logged in')) {
        if (confirm('You must be logged in to follow a host. Go to login?')) {
          router.push('/login?returnUrl=' + window.location.pathname)
        }
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
      }`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? 'Following' : 'Follow Host'}
    </button>
  )
}

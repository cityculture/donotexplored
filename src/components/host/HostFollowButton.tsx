'use client'

import { useState } from 'react'
import { toggleHostFollow } from '@/actions/social.actions'
import { useRouter } from 'next/navigation'
import { User, Users } from 'lucide-react'

interface HostFollowButtonProps {
  hostId: string
  initialIsFollowing: boolean
  followerCount?: number
  className?: string
}

export function HostFollowButton({ 
  hostId, 
  initialIsFollowing, 
  followerCount = 0,
  className = "" 
}: HostFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(followerCount)
  const router = useRouter()

  const handleFollow = async () => {
    setLoading(true)
    const result = await toggleHostFollow(hostId)
    
    if (result.error) {
      if (result.error.includes('logged in')) {
        router.push('/login')
      } else {
        alert(result.error)
      }
      setLoading(false)
      return
    }

    if (result.success) {
      const newFollowing = result.action === 'followed'
      setIsFollowing(newFollowing)
      setCount(prev => newFollowing ? prev + 1 : Math.max(0, prev - 1))
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`relative group inline-flex items-center justify-center gap-2 font-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 overflow-hidden ${
        isFollowing 
          ? 'bg-black text-white border-2 border-black hover:bg-zinc-900 shadow-sm' 
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100'
      } ${className}`}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <Users className="h-5 w-5 text-indigo-500" />
          <span>Following</span>
        </>
      ) : (
        <>
          <Users className="h-5 w-5" />
          <span>Follow Host</span>
        </>
      )}
    </button>
  )
}

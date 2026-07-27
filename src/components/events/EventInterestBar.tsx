'use client'

import { useState, useTransition } from 'react'
import { HeartIcon, BookmarkIcon, StarIcon, Loader2 } from 'lucide-react'
import { toggleEventLike, toggleEventSave, toggleEventInterest } from '@/actions/social.actions'
import { toast } from 'sonner'

interface EventInterestBarProps {
  eventId: string
  initialLikes: number
  initialInterests: number
  isLiked?: boolean
  isSaved?: boolean
  isInterested?: boolean
}

export function EventInterestBar({ 
  eventId, 
  initialLikes, 
  initialInterests,
  isLiked = false,
  isSaved = false,
  isInterested = false
}: EventInterestBarProps) {
  const [isPending, startTransition] = useTransition()
  
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(isLiked)
  
  const [interests, setInterests] = useState(initialInterests)
  const [hasInterested, setHasInterested] = useState(isInterested)
  
  const [hasSaved, setHasSaved] = useState(isSaved)

  const toggleLike = async () => {
    startTransition(async () => {
      const result = await toggleEventLike(eventId)
      if (result.success) {
        setHasLiked(result.action === 'liked')
        setLikes(prev => result.action === 'liked' ? prev + 1 : prev - 1)
      } else {
        toast.error(result.error)
      }
    })
  }

  const toggleSave = async () => {
    startTransition(async () => {
      const result = await toggleEventSave(eventId)
      if (result.success) {
        setHasSaved(result.action === 'saved')
        toast.success(result.action === 'saved' ? 'Event saved' : 'Event removed from saves')
      } else {
        toast.error(result.error)
      }
    })
  }

  const toggleInterest = async () => {
    startTransition(async () => {
      const result = await toggleEventInterest(eventId)
      if (result.success) {
        setHasInterested(result.action === 'added' || result.action === 'updated')
        setInterests(prev => (result.action === 'added') ? prev + 1 : (result.action === 'removed' ? prev - 1 : prev))
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={toggleLike}
        disabled={isPending}
        className={`flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition-all shadow-sm active:scale-95
          ${hasLiked 
            ? 'border-red-950 bg-red-950 text-white' 
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartIcon className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />}
        <span>{likes > 0 ? likes : 'Like'}</span>
      </button>

      <button 
        onClick={toggleInterest}
        disabled={isPending}
        className={`flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition-all shadow-sm active:scale-95
          ${hasInterested 
            ? 'border-blue-950 bg-blue-950 text-white' 
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StarIcon className={`h-4 w-4 ${hasInterested ? 'fill-current' : ''}`} />}
        <span className="hidden sm:inline">{interests > 0 ? `${interests} Interested` : 'Interested'}</span>
      </button>

      <button 
        onClick={toggleSave}
        disabled={isPending}
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all shadow-sm active:scale-95
           ${hasSaved
             ? 'border-black bg-black text-white'
             : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
           }
        `}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkIcon className={`h-4 w-4 ${hasSaved ? 'fill-current' : ''}`} />}
        <span className="sr-only">Save</span>
      </button>
    </div>
  )
}


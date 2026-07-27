'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations'
import { ConversationWithParticipants } from '@/lib/repositories/messages.repository'
import { MessageCircle } from 'lucide-react'

type Props = {
  userId: string
  initialConversations: ConversationWithParticipants[]
  activeConversationId?: string
}

export function ConversationList({ userId, initialConversations, activeConversationId }: Props) {
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>(initialConversations)

  useRealtimeConversations(userId, (payload) => {
    // payload is a partial ConversationRow from postgres_changes
    setConversations((prev) => {
      const existing = prev.find(c => c.id === payload.id)
      if (existing) {
        // Update existing conversation preserving `other_participant`
        const updated = { ...existing, ...payload }
        
        // Re-sort so newest is at the top
        return [...prev.filter(c => c.id !== payload.id), updated].sort(
          (a, b) => new Date(b.last_message_at || b.created_at || 0).getTime() - new Date(a.last_message_at || a.created_at || 0).getTime()
        )
      } else {
        // If it's a completely new conversation we don't have the participant alias,
        // so we'd need to fetch it or rely on a hard refresh. For real-time freshness, 
        // we'll trigger a page refresh or soft reload in production, but for now we'll 
        // append it with a placeholder.
        const newConv = payload as ConversationWithParticipants
        if (!newConv.other_participant) {
            newConv.other_participant = { anonymous_alias: 'New User' }
        }
        return [newConv, ...prev].sort(
          (a, b) => new Date(b.last_message_at || b.created_at || 0).getTime() - new Date(a.last_message_at || a.created_at || 0).getTime()
        )
      }
    })
  })

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <MessageCircle className="h-12 w-12 mb-4 text-gray-400" />
        <p className="text-sm">No conversations yet.</p>
        <p className="text-xs mt-1">Chat with other members anonymously!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
      {conversations.map((conv) => {
        const isActive = conv.id === activeConversationId
        
        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className={`flex flex-col p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${
              isActive ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
            }`}
          >
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {conv.other_participant?.anonymous_alias || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true }) : ''}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {conv.is_blocked_by_p1 || conv.is_blocked_by_p2 ? (
                <span className="italic text-gray-400">Blocked</span>
              ) : (
                conv.last_message_preview || <span className="italic">No messages yet</span>
              )}
            </p>
          </Link>
        )
      })}
    </div>
  )
}

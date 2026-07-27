'use client'

import { useState, useEffect } from 'react'
import { DiscussionPost } from './DiscussionPost'
import { MessageSquare, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DiscussionPostType {
  id: string
  user_id: string
  message: string
  created_at: string
  is_anonymous: boolean
  user?: {
    full_name: string | null
    username: string
    anonymous_alias: string
  }
}

type Props = {
  eventId: string
  currentUserId?: string
}

export function DiscussionSection({ eventId, currentUserId }: Props) {
  const [posts, setPosts] = useState<DiscussionPostType[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('event_discussions')
        .select('*, user:users(username, anonymous_alias, full_name)')
        .eq('event_id', eventId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPosts(data as unknown as DiscussionPostType[])
      }
      setIsLoading(false)
    }

    fetchPosts()

    // Robust guard for realtime
    if (typeof window === 'undefined' || (typeof WebSocket !== 'function' && typeof globalThis.WebSocket !== 'function')) {
      return
    }

    // Real-time subscription
    const channel = supabase
      .channel(`event-discussions-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_discussions',
          filter: `event_id=eq.${eventId}`
        },
        async (payload) => {
          // Fetch the user data for the new post
          const { data: newUserPost } = await supabase
            .from('event_discussions')
            .select('*, user:users(username, anonymous_alias, full_name)')
            .eq('id', payload.new.id)
            .single()

          if (newUserPost) {
            setPosts(prev => [newUserPost as unknown as DiscussionPostType, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || !currentUserId || isSending) return

    setIsSending(true)
    try {
      const { error } = await supabase
        .from('event_discussions')
        .insert({
          event_id: eventId,
          user_id: currentUserId,
          message: message.trim(),
          is_anonymous: false // Default to false for now, can be toggled
        })

      if (error) throw error
      setMessage('')
    } catch (error: unknown) {
      console.error('Error posting comment:', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="mt-12">
      <div className="flex items-center space-x-2 mb-6 text-slate-950">
        <MessageSquare className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-semibold">Discussion</h2>
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question or share a thought..."
              className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[100px]"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to start the discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <DiscussionPost key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}

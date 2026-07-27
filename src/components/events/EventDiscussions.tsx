'use client'

import { useState, useTransition } from 'react'
import { createDiscussionPost, toggleDiscussionLike } from '@/actions/discussion.actions'
import { MessageSquare, ThumbsUp, Reply, Pin, Loader2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DiscussionItem {
  id: string
  message: string
  created_at: string
  is_pinned: boolean
  is_host_reply: boolean
  is_anonymous: boolean
  like_count: number
  parent_id: string | null
  user: {
    full_name: string | null
    username: string
    avatar_url: string | null
    anonymous_alias: string | null
  }
  replies?: DiscussionItem[]
}

interface EventDiscussionsProps {
  eventId: string
  initialDiscussions: DiscussionItem[]
  currentUserId?: string
}

export function EventDiscussions({ eventId, initialDiscussions, currentUserId }: EventDiscussionsProps) {
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    if (!message.trim()) return

    const formData = new FormData()
    formData.append('eventId', eventId)
    formData.append('message', message)
    formData.append('isAnonymous', isAnonymous.toString())
    if (parentId) formData.append('parentId', parentId)

    startTransition(async () => {
      const result = await createDiscussionPost(formData)
      if (result.success) {
        setMessage('')
        setReplyingTo(null)
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const handleLike = async (discussionId: string) => {
    startTransition(async () => {
      const result = await toggleDiscussionLike(discussionId, eventId)
      if (result.error) alert(result.error)
    })
  }

  const renderComment = (comment: DiscussionItem, isReply = false) => {
    const displayName = comment.is_anonymous
      ? (comment.user.anonymous_alias || 'Anonymous Member')
      : (comment.user.full_name || comment.user.username || 'Member')
    const avatar = comment.is_anonymous ? null : comment.user.avatar_url

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mt-6'} space-y-3`}>
        <div className="flex gap-4">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">
                {displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{displayName}</span>
              {comment.is_host_reply && (
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  HOST
                </span>
              )}
              {comment.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.message}</p>
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                <ThumbsUp className="h-3 w-3" />
                {comment.like_count > 0 && comment.like_count}
                Like
              </button>
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            </div>

            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                />
                <button
                  type="submit"
                  disabled={isPending || !message.trim()}
                  className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    )
  }

  // Nest replies
  const threadDiscussions = () => {
    const map = new Map<string, DiscussionItem>()
    const roots: DiscussionItem[] = []

    initialDiscussions.forEach((d) => {
      map.set(d.id, { ...d, replies: [] })
    })

    initialDiscussions.forEach((d) => {
      const item = map.get(d.id)!
      if (d.parent_id && map.has(d.parent_id)) {
        map.get(d.parent_id)!.replies!.push(item)
      } else {
        roots.push(item)
      }
    })

    return roots
  }

  const roots = threadDiscussions()

  return (
    <section id="discussions" className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900">Discussions</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-600">
          <MessageSquare className="h-4 w-4" />
          {initialDiscussions.length} Comments
        </div>
      </div>

      {/* Main Form */}
      {currentUserId ? (
        <form onSubmit={(e) => handleSubmit(e)} className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            rows={3}
            className="w-full resize-none bg-transparent text-sm focus:outline-none dark:text-gray-100"
          />
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer dark:text-gray-400">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-500 dark:border-zinc-700"
              />
              Post anonymously
            </label>
            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 dark:bg-indigo-900/20">
            <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Join the conversation</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please log in to ask a question or leave a comment.</p>
          <button
            onClick={() => window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Log In to Comment
          </button>
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-zinc-800">
        {roots.length > 0 ? (
          roots.map((root) => renderComment(root))
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first to start the discussion!</p>
          </div>
        )}
      </div>
    </section>
  )
}

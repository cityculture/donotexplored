'use client'

import { useState, useRef, useEffect } from 'react'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { sendMessageAction, markConversationReadAction, blockUserAction } from '@/actions/message.actions'
import { MessageWithSender } from '@/lib/repositories/messages.repository'
import { formatDistanceToNow } from 'date-fns'
import { ShieldAlert, Send, Image as ImageIcon, CheckCircle, MessageCircle, MoreVertical, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ReportModal } from '../modals/ReportModal'

type Props = {
  conversationId: string
  initialMessages: MessageWithSender[]
  currentUserId: string
  otherParticipantAlias: string
  otherParticipantId: string
  isBlockedMode: boolean
}

export function ChatWindow({ 
  conversationId, 
  initialMessages, 
  currentUserId,
  otherParticipantAlias,
  otherParticipantId,
  isBlockedMode
}: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [reportState, setReportState] = useState<{ isOpen: boolean; type: 'message' | 'user'; id: string }>({
    isOpen: false,
    type: 'message',
    id: ''
  })

  // Auto-scroll to bottom on mount and new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Mark all as read when mounted if there are messages
  useEffect(() => {
    if (messages.length > 0 && !isBlockedMode) {
      markConversationReadAction(conversationId).catch(console.error)
    }
  }, [conversationId, messages, isBlockedMode])

  // Subscribe to real-time messages
  useRealtimeMessages(conversationId, (newMsg) => {
    setMessages(prev => {
      // prevent duplicates
      if (prev.find(m => m.id === newMsg.id)) return prev
      return [...prev, newMsg]
    })
    
    // Also mark read if it comes from the other participant
    if (newMsg.sender_id !== currentUserId && !isBlockedMode) {
      markConversationReadAction(conversationId).catch(console.error)
    }
  })

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim() || isSending || isBlockedMode) return

    const content = inputText
    setInputText('') // optimistic clearing
    setIsSending(true)

    try {
      await sendMessageAction(conversationId, content)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to send message: ' + message)
      setInputText(content) // restore
    } finally {
      setIsSending(false)
    }
  }

  async function handleBlock() {
    if (!confirm(`Are you sure you want to block ${otherParticipantAlias}? You will not be able to message each other.`)) {
      return
    }

    setIsBlocking(true)
    try {
      await blockUserAction(otherParticipantId)
      toast.success(`Blocked ${otherParticipantAlias}`)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to block user: ' + message)
    } finally {
      setIsBlocking(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm">
            {otherParticipantAlias.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{otherParticipantAlias}</h3>
            <p className="text-xs text-gray-500">Anonymous participant</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isBlockedMode && (
            <>
              <button 
                onClick={() => setReportState({ isOpen: true, type: 'user', id: otherParticipantId })}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Report user"
              >
                <Flag className="w-5 h-5" />
              </button>
              <button 
                onClick={handleBlock}
                disabled={isBlocking}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Block user"
              >
                <ShieldAlert className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
            <p>This is the beginning of your conversation with {otherParticipantAlias}.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId
            const showTime = index === 0 || 
                             new Date(msg.created_at || 0).getTime() - new Date(messages[index - 1].created_at || 0).getTime() > 1000 * 60 * 5
                             
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showTime && (
                  <span className="text-[10px] text-gray-400 my-2 px-1">
                    {formatDistanceToNow(new Date(msg.created_at || 0), { addSuffix: true })}
                  </span>
                )}
                <div className={`flex items-center group gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div 
                    className={`relative max-w-[80%] md:max-w-[100%] rounded-2xl px-4 py-2 ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                  </div>
                  
                  {!isMe && (
                    <button 
                      onClick={() => setReportState({ isOpen: true, type: 'message', id: msg.id })}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                      title="Report message"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <ReportModal 
        isOpen={reportState.isOpen}
        onClose={() => setReportState(prev => ({ ...prev, isOpen: false }))}
        reportedType={reportState.type}
        reportedId={reportState.id}
      />

      {/* Message Input Setup */}
      {isBlockedMode ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border-t border-gray-200 dark:border-zinc-800 text-center text-sm text-red-600 dark:text-red-400">
          This conversation is blocked. Messages cannot be sent.
        </div>
      ) : (
        <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-end">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder="Type an anonymous message..."
            className="flex-1 max-h-32 min-h-[44px] block w-full resize-none rounded-xl border-0 bg-gray-50 dark:bg-zinc-900 py-3 pr-4 pl-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="ml-3 mb-[2px] inline-flex items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      )}

    </div>
  )
}

'use client'

import { Bell } from 'lucide-react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { markAllReadAction, markAsReadAction } from '@/actions/notification.actions'

import { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

export function NotificationBell({ userId }: { userId: string }) {
  const { unreadCount, setUnreadCount } = useRealtimeNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setNotifications(data as Notification[])
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    const result = await markAllReadAction()
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  const handleNotificationClick = async (id: string, actionUrl?: string | null) => {
    await markAsReadAction(id)
    setIsOpen(false)
    if (actionUrl) {
      window.location.href = actionUrl
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Bell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.action_url)}
                  className={`p-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="flex justify-between gap-2">
                    <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{n.body}</p>
                </div>
              ))
            )}
          </div>
          
          <Link 
            href="/members/notifications" 
            onClick={() => setIsOpen(false)}
            className="block p-3 text-center text-xs font-semibold text-gray-600 hover:text-indigo-600 border-t"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  )
}

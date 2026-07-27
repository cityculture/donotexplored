'use client'

import { useState, useTransition } from 'react'
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/actions/user.actions'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, BookmarkCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  body: string | null
  is_read: boolean
  created_at: string
  action_url: string | null
}

interface NotificationListProps {
  initialNotifications: Notification[]
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const [isPending, startTransition] = useTransition()
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleMarkAsRead = async (id: string) => {
    startTransition(async () => {
      const res = await markNotificationAsReadAction(id)
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      } else {
        toast.error(res.error || 'Failed to mark as read')
      }
    })
  }

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsReadAction()
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        toast.success('All notifications marked as read')
      } else {
        toast.error(res.error || 'Failed to mark all as read')
      }
    })
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-6 w-10 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkCheck className="h-4 w-4" />}
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-medium italic">Your notification tray is empty.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`group relative p-6 rounded-[2rem] border transition-all ${
                !n.is_read 
                  ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' 
                  : 'bg-white border-gray-100'
              }`}
            >
               <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-3">
                    {!n.is_read && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                    <h3 className={`font-black text-lg ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h3>
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                 </span>
               </div>
               
               <p className={`text-sm leading-relaxed mb-4 ${!n.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                 {n.body}
               </p>

               <div className="flex items-center justify-between">
                  {n.action_url ? (
                    <a 
                      href={n.action_url} 
                      className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest"
                      onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                    >
                      View Details →
                    </a>
                  ) : <div />}

                  {!n.is_read && (
                    <button 
                       onClick={() => handleMarkAsRead(n.id)}
                       disabled={isPending}
                       className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-all"
                    >
                       <CheckCircle2 className="h-4 w-4" />
                       Mark as read
                    </button>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

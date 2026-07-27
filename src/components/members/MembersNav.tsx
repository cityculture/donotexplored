'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { logoutAction } from '@/actions/auth.actions'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  Heart,
  MessageSquare,
  Bell,
  CreditCard,
  QrCode
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { useRealtimeFavorites } from '@/hooks/useRealtimeFavorites'

interface User {
  id: string
  full_name?: string | null
  email?: string | null
  host_profile?: {
    id: string
    [key: string]: any
  } | null
}

interface MembersNavProps {
  user: User
}

export function MembersNav({ user }: MembersNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')
  const { unreadCount } = useRealtimeNotifications(user.id)
  const { favoriteCount } = useRealtimeFavorites(user.id)

  const hostDashboardHref = user.host_profile 
    ? `/members/host-dashboard/${user.host_profile.id}` 
    : '/members/host-dashboard/create'
  
  const hostSettingsHref = user.host_profile 
    ? `/members/host-dashboard/${user.host_profile.id}/settings` 
    : '/members/host-dashboard/create'

  const navigation = [
    { 
      title: 'Member Portal',
      items: [
        { name: 'Dashboard', href: '/members/dashboard', icon: LayoutDashboard, color: 'indigo' },
        { name: 'My Bookings', href: '/members/bookings', icon: Calendar, color: 'indigo' },
        { name: 'Favorites', href: '/members/dashboard?tab=favorites', icon: Heart, count: favoriteCount, color: 'indigo' },
        { name: 'Messages', href: '/members/messages', icon: MessageSquare, color: 'indigo' },
      ]
    },
    {
      title: 'Host Business',
      items: [
        { name: 'Managed Pages', href: '/members/dashboard?tab=managed', icon: Users, color: 'amber' },
        { name: 'Attendance', href: '/members/dashboard?tab=attendance', icon: QrCode, color: 'amber' },
        { name: 'Host Settings', href: hostSettingsHref, icon: Settings, color: 'amber' },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Notifications', href: '/members/notifications', icon: Bell, count: unreadCount, color: 'slate' },
        { name: 'Billing', href: '/members/dashboard?tab=billing', icon: CreditCard, color: 'slate' },
        { name: 'Account Settings', href: '/members/profile', icon: Settings, color: 'slate' },
      ]
    }
  ]

  return (
    <nav className="flex flex-1 flex-col bg-white border-r border-gray-200 px-4 py-8 overflow-y-auto">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-black text-gray-900 truncate italic">
          {user.full_name || user.email?.split('@')[0] || 'Member'}
        </h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Global Access</p>
      </div>

      <div className="flex flex-1 flex-col gap-y-8">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              {section.title}
            </h3>
            <ul role="list" className="flex flex-col gap-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (
                  item.href.includes('tab=') && 
                  pathname === '/members/dashboard' && 
                  currentTab === item.href.split('tab=')[1]
                )
                
                const colorClasses = {
                  indigo: isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
                  amber: isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600',
                  slate: isActive ? 'bg-slate-800 text-white shadow-lg shadow-slate-100' : 'text-gray-600 hover:bg-slate-100 hover:text-slate-900',
                }[item.color as 'indigo' | 'amber' | 'slate']

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center justify-between rounded-xl p-3 text-xs font-black uppercase tracking-tight transition-all',
                        colorClasses
                      )}
                    >
                      <div className="flex items-center gap-x-3">
                        <item.icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-current'
                          )}
                        />
                        {item.name}
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-lg text-[9px] font-black",
                          isActive ? "bg-white text-gray-900" : "bg-gray-100 text-gray-500 group-hover:bg-white"
                        )}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <form action={logoutAction}>
          <button 
            type="submit"
            className="flex w-full items-center gap-x-3 rounded-xl p-3 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
          >
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  )
}

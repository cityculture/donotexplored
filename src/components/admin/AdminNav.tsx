'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Flag, 
  BarChart3, 
  CreditCard, 
  History,
  ShieldCheck,
  ChevronRight,
  Settings,
  Tags
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/admin/admin-dashboard', icon: LayoutDashboard },
  { name: 'Hosts', href: '/admin/hosts', icon: ShieldCheck },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Payouts', href: '/admin/payouts', icon: CreditCard },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  { name: 'Settings', href: '/admin/config', icon: Settings },
]

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200 mb-4">
        <Link href="/" className="flex flex-col gap-1">
          <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent italic">
            CITY CULTURE
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 w-fit">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Admin</span>
          </div>
        </Link>
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
           <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs uppercase">
              {userName.substring(0, 2)}
           </div>
           <div className="min-w-0">
              <p className="text-xs font-black text-gray-900 truncate">@{userName}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Systems Admin</p>
           </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl transition-all group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-gray-100 mt-auto">
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">
          &copy; 2026 Platform Control
        </div>
      </div>
    </aside>
  )
}

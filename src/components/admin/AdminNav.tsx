'use client'

import { useState, useEffect } from 'react'
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
  Settings, 
  Tags,
  LogOut,
  Menu,
  X,
  Sparkles,
  LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAdminAction } from '@/actions/auth.actions'
import { auth, signOut } from '@/lib/firebase/client'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, desc: 'Overview & statistics' },
  { name: 'Hosts', href: '/admin/hosts', icon: ShieldCheck, desc: 'Host verification & approvals' },
  { name: 'Events', href: '/admin/events', icon: Calendar, desc: 'Moderation & listings' },
  { name: 'Reports', href: '/admin/reports', icon: Flag, desc: 'Flagged reports & complaints' },
  { name: 'Users', href: '/admin/users', icon: Users, desc: 'Member & host accounts' },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, desc: 'Platform performance' },
  { name: 'Discounts', href: '/admin/subscription-discounts', icon: Sparkles, desc: 'Membership promo codes' },
  { name: 'Payouts', href: '/admin/payouts', icon: CreditCard, desc: 'Financial transactions' },
  { name: 'Categories', href: '/admin/categories', icon: Tags, desc: 'Taxonomy & tags' },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: History, desc: 'System security trace' },
  { name: 'Settings', href: '/admin/config', icon: Settings, desc: 'Platform configurations' },
]

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  async function handleLogout() {
    try {
      await signOut(auth)
    } catch (e) {
      console.error('Firebase signout error:', e)
    }
    await logoutAdminAction()
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP FLOATING ICON DOCK (Screen >= md)                              */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex fixed left-4 top-4 bottom-4 z-40 w-[72px] flex-col items-center justify-between py-4 rounded-3xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 transition-all">
        {/* Brand Icon */}
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-110 hover:shadow-indigo-500/50"
          >
            <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
            
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-[80px] z-50 whitespace-nowrap rounded-xl bg-zinc-900 border border-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              City Culture Admin
            </span>
          </Link>
          <div className="h-[1px] w-8 bg-white/10 my-1" />
        </div>

        {/* Navigation Icon List */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-2.5 my-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <div
                key={item.name}
                className="relative flex items-center"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                      : "text-zinc-400 hover:bg-white/10 hover:text-white hover:scale-105"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />

                  {/* Active Indicator dot */}
                  {isActive && (
                    <span className="absolute -left-1.5 h-2 w-1 rounded-r-full bg-white shadow-sm shadow-white" />
                  )}
                </Link>

                {/* Desktop Floating Tooltip */}
                {hoveredItem === item.name && (
                  <div className="pointer-events-none absolute left-[74px] z-50 flex items-center animate-in fade-in zoom-in-95 duration-150">
                    <div className="whitespace-nowrap rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/15 px-3 py-1.5 text-xs font-bold text-white shadow-2xl flex items-center gap-2">
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom User Avatar & Logout */}
        <div className="flex flex-col items-center gap-2.5 pt-2">
          <div className="h-[1px] w-8 bg-white/10" />

          {/* User Avatar */}
          <div className="group relative flex items-center">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-xs font-black uppercase text-indigo-400 cursor-default">
              {userName.substring(0, 2)}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            </div>

            {/* User Tooltip */}
            <span className="pointer-events-none absolute left-[74px] z-50 whitespace-nowrap rounded-xl bg-zinc-900 border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300 shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              @{userName} (Admin)
            </span>
          </div>

          {/* Logout Button */}
          <div className="group relative flex items-center">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 hover:scale-105 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Logout Tooltip */}
            <span className="pointer-events-none absolute left-[74px] z-50 whitespace-nowrap rounded-xl bg-red-950/90 border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-300 shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Sign Out
            </span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE TOP HEADER (Screen < md)                                        */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-zinc-950/90 px-4 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-white italic">CITY CULTURE</span>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Admin</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* User badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span className="truncate max-w-[80px]">@{userName}</span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-indigo-400" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MOBILE FLOATING QUICK-ACCESS DOCK (Screen < md)                        */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40 flex items-center justify-around rounded-2xl border border-white/15 bg-zinc-950/90 p-1.5 backdrop-blur-2xl shadow-2xl shadow-black">
        {/* 1. Dashboard */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all",
            pathname === '/'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-0.5">Overview</span>
        </Link>

        {/* 2. Events */}
        <Link
          href="/admin/events"
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all",
            pathname === '/admin/events'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-0.5">Events</span>
        </Link>

        {/* 3. Users */}
        <Link
          href="/admin/users"
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all",
            pathname === '/admin/users'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-0.5">Users</span>
        </Link>

        {/* 4. Reports */}
        <Link
          href="/admin/reports"
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all",
            pathname === '/admin/reports'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Flag className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-0.5">Reports</span>
        </Link>

        {/* 5. All Modules / Menu */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer",
            mobileMenuOpen ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-0.5">Modules</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. FULL MOBILE SLIDE-OVER GLASS DRAWER (Screen < md)                      */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
          {/* Drawer Header */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-white italic">ALL ADMIN MODULES</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Module Icon Grid */}
          <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 px-1">
              Select Destination
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col p-3.5 rounded-2xl border transition-all active:scale-95",
                      isActive
                        ? "bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-500/10 text-white"
                        : "bg-zinc-900/60 border-white/5 hover:border-white/20 text-zinc-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-800 text-zinc-300"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs font-black text-white">{item.name}</span>
                    <span className="text-[10px] font-medium text-zinc-400 mt-0.5 line-clamp-1">{item.desc}</span>
                  </Link>
                )
              })}
            </div>

            {/* Logout button in Mobile Drawer */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 font-bold text-sm transition-all active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                Sign Out as Administrator
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

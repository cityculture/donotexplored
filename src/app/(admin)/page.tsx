import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  Calendar, 
  Ticket, 
  IndianRupee, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import { ROUTES } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Admin Dashboard | City Culture',
    description: 'Manage overview, events, users, and reports.',
  }
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  // 1. Total users
  const { count: totalUsers } = await (supabase
    .from('users') as any)
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // 2. Total events
  const { count: totalEvents } = await (supabase
    .from('events') as any)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // 3. Bookings today
  const { count: bookingsToday } = await (supabase
    .from('bookings') as any)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)

  // 4. Revenue today (platform_fee)
  const { data: revenueData } = await (supabase
    .from('bookings') as any)
    .select('platform_fee')
    .gte('paid_at', todayISO)
  
  const revenueToday = (revenueData as any[])?.reduce((acc: number, curr: any) => acc + Number(curr.platform_fee), 0) || 0

  // Recent activity: Last 10 bookings
  const { data: recentBookings } = await (supabase
    .from('bookings') as any)
    .select('booking_ref, total_amount, created_at, event:events(title)')
    .order('created_at', { ascending: false })
    .limit(10)

  // Last 5 new users
  const { data: recentUsers } = await (supabase
    .from('users') as any)
    .select('username, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Pending host approvals count
  const { count: pendingHosts } = await (supabase
    .from('users') as any)
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false)

  // Pending reports count
  const { count: pendingReports } = await (supabase
    .from('reports') as any)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const stats = [
    { 
      name: 'Total Active Users', 
      value: (totalUsers || 0).toLocaleString(), 
      icon: Users, 
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-500/20 to-blue-500/5',
      borderColor: 'group-hover:border-cyan-500/40',
      badge: 'Platform Wide'
    },
    { 
      name: 'Published Events', 
      value: (totalEvents || 0).toLocaleString(), 
      icon: Calendar, 
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'group-hover:border-emerald-500/40',
      badge: 'Live on Site'
    },
    { 
      name: 'Bookings Today', 
      value: (bookingsToday || 0).toLocaleString(), 
      icon: Ticket, 
      color: 'text-purple-400',
      bgGlow: 'from-purple-500/20 to-indigo-500/5',
      borderColor: 'group-hover:border-purple-500/40',
      badge: '24h Velocity'
    },
    { 
      name: 'Revenue Today', 
      value: `₹${revenueToday.toLocaleString()}`, 
      icon: IndianRupee, 
      color: 'text-amber-400',
      bgGlow: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'group-hover:border-amber-500/40',
      badge: 'Platform Fee'
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Live Production Control
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Admin Overview
            <Sparkles className="h-6 w-6 text-indigo-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Real-time analytics, user telemetry, and operational moderation.
          </p>
        </div>

        {/* Quick-action Shortcuts Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={ROUTES.ADMIN.EVENTS}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-indigo-500/40 hover:bg-zinc-800 text-xs font-bold text-zinc-200 transition-all hover:scale-105"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Moderate Events
          </Link>
          <Link
            href={ROUTES.ADMIN.HOSTS}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-emerald-500/40 hover:bg-zinc-800 text-xs font-bold text-zinc-200 transition-all hover:scale-105"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Hosts ({pendingHosts || 0})
          </Link>
        </div>
      </div>

      {/* 4 Glowing Holographic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={cn(
              "group relative overflow-hidden rounded-3xl bg-zinc-950/70 border border-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black",
              stat.borderColor
            )}
          >
            {/* Ambient Background Gradient Glow on hover */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              stat.bgGlow
            )} />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  {stat.badge}
                </span>
                <p className="text-xs font-bold text-zinc-400 mt-0.5">
                  {stat.name}
                </p>
                <h3 className="text-3xl font-black text-white tracking-tight mt-2 font-mono">
                  {stat.value}
                </h3>
              </div>

              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 transition-transform duration-300 group-hover:scale-110",
                stat.color
              )}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Bookings + Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Bookings */}
        <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Ticket className="h-4 w-4" />
              </div>
              <h2 className="text-base font-black tracking-tight text-white uppercase italic">
                Recent Bookings
              </h2>
            </div>
            <Link
              href={ROUTES.ADMIN.EVENTS}
              className="text-[10px] font-black tracking-wider uppercase text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/5 flex-1 mt-2">
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.map((booking: any) => (
                <div
                  key={booking.booking_ref}
                  className="py-3.5 flex items-center justify-between group hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-black text-white truncate group-hover:text-indigo-300 transition-colors">
                      {(booking.event as any)?.title || 'Private / Ticketed Event'}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      #{booking.booking_ref} • {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-400 font-mono">
                      ₹{Number(booking.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs font-bold text-zinc-500">
                No recent bookings recorded today
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Action Required + New Users */}
        <div className="space-y-6">
          {/* Action Required */}
          <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h2 className="text-base font-black tracking-tight text-white uppercase italic">
                Action Required
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Link
                href={ROUTES.ADMIN.USERS + '?status=pending'}
                className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Pending Hosts
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-white font-mono">
                    {pendingHosts || 0}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Need Verification</p>
                </div>
              </Link>

              <Link
                href={ROUTES.ADMIN.REPORTS}
                className="group relative p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 hover:border-red-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                    Open Reports
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-red-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-white font-mono">
                    {pendingReports || 0}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Flagged Listings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* New Users Feed */}
          <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-base font-black tracking-tight text-white uppercase italic">
                Recent Sign-Ups
              </h2>
            </div>

            <div className="divide-y divide-white/5 mt-2">
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((user: any) => (
                  <div
                    key={user.username}
                    className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black uppercase text-indigo-400 font-mono">
                        {user.username.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">@{user.username}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-400">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-bold text-zinc-500">
                  No new users registered recently
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

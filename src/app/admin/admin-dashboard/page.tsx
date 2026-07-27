import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  Calendar, 
  Ticket, 
  IndianRupee, 
  ArrowUpRight, 
  ShieldAlert, 
  Flag 
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

  // Recent activity
  // Last 10 bookings
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
    .from('host_pages') as any)
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false)

  // Pending reports count
  const { count: pendingReports } = await (supabase
    .from('reports') as any)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const stats = [
    { name: 'Total Active Users', value: totalUsers, icon: Users, color: 'text-blue-600' },
    { name: 'Published Events', value: totalEvents, icon: Calendar, color: 'text-green-600' },
    { name: 'Bookings Today', value: bookingsToday, icon: Ticket, color: 'text-purple-600' },
    { name: 'Revenue Today', value: `₹${revenueToday.toLocaleString()}`, icon: IndianRupee, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Overview</h1>
        <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Live Statistics & Real-time Platform Control</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50 transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.name}</p>
                <h3 className="text-3xl font-black mt-1 text-gray-950">{stat.value}</h3>
              </div>
              <div className={cn("p-4 rounded-2xl bg-gray-50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Bookings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
              <Ticket className="w-5 h-5 text-indigo-500" />
              Recent Bookings
            </h2>
            <Link href={ROUTES.ADMIN.EVENTS} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((booking: any) => (
                  <div key={booking.booking_ref} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div>
                      <p className="text-sm font-black text-gray-900 italic">{(booking.event as any)?.title || 'Unknown Event'}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">{booking.booking_ref} • {new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-lg font-black text-indigo-600 tracking-tighter italic">₹{Number(booking.total_amount).toLocaleString()}</p>
                  </div>
                ))
            ) : (
              <div className="p-12 text-center text-gray-400 text-sm font-bold italic">No recent bookings</div>
            )}
          </div>
        </div>

        {/* Action Required & New Users */}
        <div className="space-y-12">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
             <div className="p-8 border-b border-gray-50">
                <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Action Required
                </h2>
             </div>
             <div className="p-6 grid grid-cols-2 gap-6">
                <Link href={ROUTES.ADMIN.USERS + '?status=pending'} className="p-6 rounded-[1.5rem] bg-orange-50 border border-orange-100 group transition-all hover:shadow-lg">
                   <p className="text-[10px] text-orange-800 font-black uppercase tracking-widest">Pending Hosts</p>
                   <div className="flex items-center justify-between mt-2">
                      <span className="text-4xl font-black text-orange-900 italic tracking-tighter">{pendingHosts || 0}</span>
                      <ArrowUpRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   </div>
                </Link>
                <Link href={ROUTES.ADMIN.REPORTS} className="p-6 rounded-[1.5rem] bg-red-50 border border-red-100 group transition-all hover:shadow-lg">
                   <p className="text-[10px] text-red-800 font-black uppercase tracking-widest">Open Reports</p>
                   <div className="flex items-center justify-between mt-2">
                      <span className="text-4xl font-black text-red-900 italic tracking-tighter">{pendingReports || 0}</span>
                      <ArrowUpRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   </div>
                </Link>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 text-gray-900">
              <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
                <Users className="w-5 h-5 text-gray-400" />
                New Users
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((user: any) => (
                  <div key={user.username} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 text-sm font-black uppercase italic">
                        {user.username.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">@{user.username}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm font-bold italic">No new users</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

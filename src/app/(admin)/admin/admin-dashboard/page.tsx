import { queryBackendDb } from '@/lib/backendClient'
import { 
  Users, 
  Calendar, 
  Ticket, 
  UserCheck, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import { ROUTES } from '@/lib/routes'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Admin Dashboard | City Culture',
    description: 'Manage overview, events, users, and reports.',
  }
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const nowISO = new Date().toISOString()

  // 1. Total events count
  let totalEvents = 0
  try {
    const eventsResult = await queryBackendDb({
      table: 'events',
      action: 'select',
      selectQuery: 'id'
    })
    totalEvents = eventsResult ? eventsResult.length : 0
  } catch (e) {
    console.error('Error fetching total events:', e)
  }

  // 2. Booked tickets (sum of quantity in booking_items where booking status is confirmed)
  let bookedTickets = 0
  try {
    const bookingsResult = await queryBackendDb({
      table: 'booking_items',
      action: 'select',
      selectQuery: 'quantity'
    })
    bookedTickets = bookingsResult?.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0) || 0
  } catch (e) {
    console.error('Error fetching booked tickets:', e)
  }

  // 3. Active subscribers count
  let totalSubscribers = 0
  try {
    const subsResult = await queryBackendDb({
      table: 'user_subscriptions',
      action: 'select',
      selectQuery: 'id',
      filters: [{ type: 'eq', args: ['status', 'active'] }]
    })
    totalSubscribers = subsResult ? subsResult.length : 0
  } catch (e) {
    console.error('Error fetching subscribers:', e)
  }

  // 4. Total users count
  let totalUsers = 0
  try {
    const usersResult = await queryBackendDb({
      table: 'users',
      action: 'select',
      selectQuery: 'id',
      filters: [{ type: 'eq', args: ['is_active', true] }]
    })
    totalUsers = usersResult ? usersResult.length : 0
  } catch (e) {
    console.error('Error fetching total users:', e)
  }

  // 5. Subscribers list (Recent 5)
  let subscribersList: any[] = []
  try {
    subscribersList = await queryBackendDb({
      table: 'user_subscriptions',
      action: 'select',
      selectQuery: 'id, customer_name, customer_email, status, plan_id, created_at',
      filters: [
        { type: 'order', args: ['created_at', { ascending: false }] },
        { type: 'limit', args: [5] }
      ]
    }) || []
  } catch (e) {
    console.error('Error fetching subscribers list:', e)
  }

  // 6. Users list (Recent 5)
  let usersList: any[] = []
  try {
    usersList = await queryBackendDb({
      table: 'users',
      action: 'select',
      selectQuery: 'id, username, email, role, created_at',
      filters: [
        { type: 'order', args: ['created_at', { ascending: false }] },
        { type: 'limit', args: [5] }
      ]
    }) || []
  } catch (e) {
    console.error('Error fetching users list:', e)
  }

  // 7. Upcoming events (Upcoming 5 published)
  let upcomingEvents: any[] = []
  try {
    upcomingEvents = await queryBackendDb({
      table: 'events',
      action: 'select',
      selectQuery: 'id, title, slug, start_datetime, status, cover_image_url, city',
      filters: [
        { type: 'eq', args: ['status', 'published'] },
        { type: 'gte', args: ['start_datetime', nowISO] },
        { type: 'order', args: ['start_datetime', { ascending: true }] },
        { type: 'limit', args: [5] }
      ]
    }) || []
  } catch (e) {
    console.error('Error fetching upcoming events:', e)
  }

  // 8. Pending host approvals count
  let pendingHosts = 0
  try {
    const pendingHostsResult = await queryBackendDb({
      table: 'host_pages',
      action: 'select',
      selectQuery: 'id',
      filters: [{ type: 'eq', args: ['is_approved', false] }]
    })
    pendingHosts = pendingHostsResult ? pendingHostsResult.length : 0
  } catch (e) {
    console.error('Error fetching pending hosts:', e)
  }

  // 9. Pending reports count
  let pendingReports = 0
  try {
    const pendingReportsResult = await queryBackendDb({
      table: 'reports',
      action: 'select',
      selectQuery: 'id',
      filters: [{ type: 'eq', args: ['status', 'pending'] }]
    })
    pendingReports = pendingReportsResult ? pendingReportsResult.length : 0
  } catch (e) {
    console.error('Error fetching pending reports:', e)
  }

  const stats = [
    { name: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Booked Tickets', value: bookedTickets, icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Active Subscribers', value: totalSubscribers, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Total Users', value: totalUsers, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Overview</h1>
        <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Live Statistics & Real-time Platform Control</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50/50 transition-all hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.name}</p>
                <h3 className="text-3xl font-black mt-1 text-gray-950">{stat.value}</h3>
              </div>
              <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Required Board */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-950 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black italic uppercase tracking-tighter">System Alert Board</h2>
          </div>
          <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest">Pending approvals and open escalations requiring response</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 relative z-10">
          <Link href={ROUTES.ADMIN.USERS + '?status=pending'} className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-all px-6 py-4 rounded-2xl border border-white/10 group">
            <div>
              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Pending Hosts</p>
              <h4 className="text-3xl font-black italic tracking-tighter mt-0.5">{pendingHosts}</h4>
            </div>
            <ArrowUpRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          <Link href={ROUTES.ADMIN.REPORTS} className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-all px-6 py-4 rounded-2xl border border-white/10 group">
            <div>
              <p className="text-[9px] font-black text-red-300 uppercase tracking-widest">Open Reports</p>
              <h4 className="text-3xl font-black italic tracking-tighter mt-0.5">{pendingReports}</h4>
            </div>
            <ArrowUpRight className="w-5 h-5 text-red-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Column 1: Upcoming Events */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Upcoming Events
            </h2>
            <Link href={ROUTES.ADMIN.EVENTS} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: any) => (
                <div key={event.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    {event.cover_image_url ? (
                      <img src={event.cover_image_url} alt={event.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        <Calendar className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 italic truncate max-w-[220px]">{event.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">
                        {new Date(event.start_datetime).toLocaleDateString()} • {event.city || 'Anywhere'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase border-none">
                    {event.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400 text-sm font-bold italic">No upcoming events</div>
            )}
          </div>
        </div>

        {/* Column 2: Recent Subscribers */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
              <Layers className="w-5 h-5 text-indigo-500" />
              Recent Subscribers
            </h2>
            <span className="text-[10px] font-black bg-green-50 text-green-700 px-4 py-1.5 rounded-full uppercase tracking-widest">Active Pool</span>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {subscribersList && subscribersList.length > 0 ? (
              subscribersList.map((sub: any) => (
                <div key={sub.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 italic">{sub.customer_name || 'Anonymous User'}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">{sub.customer_email}</p>
                  </div>
                  <Badge 
                    variant={sub.status === 'active' ? 'success' : 'outline'}
                    className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase border-none"
                  >
                    {sub.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400 text-sm font-bold italic">No recent subscribers</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
            <Users className="w-5 h-5 text-indigo-500" />
            Recent Users
          </h2>
          <Link href={ROUTES.ADMIN.USERS} className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors">Directory →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {usersList && usersList.length > 0 ? (
            usersList.map((user: any) => (
              <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 text-sm font-black uppercase italic">
                    {user.username.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">@{user.username}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Joined {new Date(user.created_at).toLocaleDateString()} • {user.email}</p>
                  </div>
                </div>
                <Badge className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none">
                  {user.role}
                </Badge>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 text-sm font-bold italic">No new users</div>
          )}
        </div>
      </div>
    </div>
  )
}

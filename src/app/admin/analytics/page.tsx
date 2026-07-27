import { createClient } from '@/lib/supabase/server'
import { RevenueChart, CategoryChart } from '@/components/admin/AnalyticsChart'
import { 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Activity,
  ArrowDownRight,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import SnapshotButton from '@/components/admin/SnapshotButton'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()
  const p = await searchParams
  const period = p.period || '7d'
  
  const days = period === '30d' ? 30 : period === '90d' ? 90 : 7
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // 1. Fetch historical data from analytics_daily
  const { data: history } = await (supabase
    .from('analytics_daily') as any)
    .select('*')
    .eq('metric_type', 'platform')
    .gte('snapshot_date', startDate.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: true })

  // 2. Fetch Category breakdown (Current)
  const { data: eventsByCategory } = await (supabase
    .from('events') as any)
    .select('category_id, categories(name)')
  
  const categoryCounts = eventsByCategory?.reduce((acc: any, curr: any) => {
    const name = curr.categories?.name || 'Uncategorized'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {}) || {}
  
  const categoryChartData = Object.entries(categoryCounts)
    .map(([name, count]) => ({ category_name: name, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)

  // 3. Live Counts
  const { count: activeEvents } = await (supabase
    .from('events') as any)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .lte('start_datetime', new Date().toISOString())
    .gte('end_datetime', new Date().toISOString())

  const { data: pendingPayoutsData } = await (supabase
    .from('payouts') as any)
    .select('net_amount')
    .eq('status', 'pending')
  
  const pendingPayoutsTotal = (pendingPayoutsData as any[])?.reduce((acc: number, curr: any) => acc + Number(curr.net_amount), 0) || 0

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Analytics Intel</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Deep dive into platform growth and revenue trends</p>
        </div>
        
        <div className="flex items-center gap-4">
          <SnapshotButton />
          <div className="flex bg-gray-50 rounded-2xl p-1.5 border border-gray-100 shadow-inner">
            {['7d', '30d', '90d'].map((d) => (
              <Link
                key={d}
                href={`/admin/analytics?period=${d}`}
                className={cn(
                  "px-6 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
                  period === d 
                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100/50" 
                    : "text-gray-400 hover:text-gray-900"
                )}
              >
                {d}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Live Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="relative group p-10 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 overflow-hidden">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none animate-pulse font-black px-4 py-1.5 rounded-full">LIVE NOW</Badge>
               </div>
               <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-80">Currently Active Events</p>
               <h3 className="text-6xl font-black mt-2 tabular-nums italic">{activeEvents || 0}</h3>
            </div>
         </div>
         <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-gray-50 rounded-full blur-3xl transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                   <CreditCard className="w-7 h-7 text-amber-500" />
                 </div>
                 <Link href="/admin/payouts" className="text-[10px] text-indigo-600 font-black hover:underline flex items-center gap-1.5 uppercase tracking-widest">
                   MANAGE PAYOUTS <ArrowDownRight className="w-3.5 h-3.5 rotate-[225deg]" />
                 </Link>
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pending Payouts</p>
              <h3 className="text-6xl font-black mt-2 text-gray-900 tabular-nums italic">
                <span className="text-2xl opacity-20 not-italic mr-1">₹</span>
                {pendingPayoutsTotal.toLocaleString()}
              </h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-black text-xl text-gray-900 italic flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
              Revenue Evolution
            </h2>
            <div className="flex items-center gap-3">
               <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PLATFORM FEE REVENUE</span>
            </div>
          </div>
          <div className="p-8">
            <RevenueChart data={history || []} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden flex flex-col">
           <div className="p-10 border-b border-gray-50">
              <h2 className="font-black text-xl text-gray-900 italic flex items-center gap-4">
                <Calendar className="w-6 h-6 text-purple-500" />
                Pop. Categories
              </h2>
           </div>
           <div className="p-8 flex-1 flex flex-col justify-center">
              <CategoryChart data={categoryChartData} />
           </div>
        </div>
      </div>
      
      {/* Daily Metrics Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
           <h2 className="font-black text-xl text-gray-900 italic">Platform Performance Logs</h2>
           <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">LATEST {history?.length || 0} RECORDS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-10 py-6">SNAPSHOT DATE</th>
                <th className="px-10 py-6">NEW USERS</th>
                <th className="px-10 py-6">NEW EVENTS</th>
                <th className="px-10 py-6">BOOKINGS</th>
                <th className="px-10 py-6 text-right">GROSS REVENUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {history?.slice().reverse().map((day: any) => (
                <tr key={day.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <span className="text-gray-900 font-black italic">{new Date(day.snapshot_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-indigo-600 font-black">+{day.new_users}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                      {day.new_events} events
                    </span>
                  </td>
                  <td className="px-10 py-6 tabular-nums font-black text-gray-900 italic">{day.total_bookings}</td>
                  <td className="px-10 py-6 text-right font-black text-gray-900 italic text-lg">
                    <span className="text-xs opacity-30 not-italic mr-1">₹</span>
                    {Number(day.total_revenue).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!history || history.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center text-gray-400 font-black italic uppercase tracking-widest opacity-30">
                    Historical playback will appear here once daily snapshots are initiated.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

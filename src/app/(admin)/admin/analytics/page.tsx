import { createClient } from '@/lib/supabase/server'
import { RevenueChart, CategoryChart } from '@/components/admin/AnalyticsChart'
import { 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Activity,
  ArrowDownRight,
  BarChart3
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Analytics Intel
            <BarChart3 className="h-6 w-6 text-cyan-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Deep dive into platform growth, ticket velocities, and revenue trends.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <SnapshotButton />
          <div className="flex bg-zinc-900/80 rounded-2xl p-1 border border-white/10">
            {['7d', '30d', '90d'].map((d) => (
              <Link
                key={d}
                href={`/admin/analytics?period=${d}`}
                className={cn(
                  "px-4 py-1.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
                  period === d 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {d}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Live Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="relative group p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-2xl overflow-hidden border border-indigo-400/30">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none animate-pulse font-black px-3 py-1 rounded-full text-[10px]">LIVE NOW</Badge>
               </div>
               <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Currently Active Events</p>
               <h3 className="text-5xl font-black mt-2 tabular-nums italic font-mono">{activeEvents || 0}</h3>
            </div>
         </div>
         <div className="p-8 bg-zinc-950/70 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                   <CreditCard className="w-6 h-6 text-amber-400" />
                 </div>
                 <Link href="/admin/payouts" className="text-[10px] text-indigo-400 font-black hover:underline flex items-center gap-1 uppercase tracking-widest">
                   MANAGE PAYOUTS <ArrowDownRight className="w-3.5 h-3.5 rotate-[225deg]" />
                 </Link>
              </div>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Pending Payouts</p>
              <h3 className="text-5xl font-black mt-2 text-white tabular-nums italic font-mono">
                <span className="text-2xl opacity-40 not-italic mr-1">₹</span>
                {pendingPayoutsTotal.toLocaleString()}
              </h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-black text-lg text-white italic flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Revenue Evolution
            </h2>
            <div className="flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PLATFORM FEE REVENUE</span>
            </div>
          </div>
          <div className="p-6">
            <RevenueChart data={history || []} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
           <div className="p-6 border-b border-white/10">
              <h2 className="font-black text-lg text-white italic flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                Popular Categories
              </h2>
           </div>
           <div className="p-6 flex-1 flex flex-col justify-center">
              <CategoryChart data={categoryChartData} />
           </div>
        </div>
      </div>
      
      {/* Daily Metrics Table */}
      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
           <h2 className="font-black text-lg text-white italic">Platform Performance Logs</h2>
           <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">LATEST {history?.length || 0} RECORDS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">SNAPSHOT DATE</th>
                <th className="px-6 py-4">NEW USERS</th>
                <th className="px-6 py-4">NEW EVENTS</th>
                <th className="px-6 py-4">BOOKINGS</th>
                <th className="px-6 py-4 text-right">GROSS REVENUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {history?.slice().reverse().map((day: any) => (
                <tr key={day.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-white font-black italic">{new Date(day.snapshot_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-indigo-400 font-black font-mono">+{day.new_users}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                      {day.new_events} events
                    </span>
                  </td>
                  <td className="px-6 py-4 tabular-nums font-black text-white italic font-mono">{day.total_bookings}</td>
                  <td className="px-6 py-4 text-right font-black text-white italic text-base font-mono">
                    <span className="text-xs opacity-40 not-italic mr-1">₹</span>
                    {Number(day.total_revenue).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!history || history.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-black italic uppercase tracking-widest">
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

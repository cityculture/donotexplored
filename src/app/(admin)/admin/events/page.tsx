import { createClient } from '@/lib/supabase/server'
import EventActionButton from '@/components/admin/EventActionButton'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  User,
  Eye,
  Ticket,
  AlertTriangle,
  Star,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string, reported?: string }>
}) {
  const supabase = await createClient()
  const p = await searchParams
  const status = p.status || 'all'
  const reportedOnly = p.reported === 'true'

  let query = (supabase
    .from('events') as any)
    .select('*, host:users(username), host_page:host_pages(id, display_name)')
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data: allEvents } = await query

  const eventIds = (allEvents as any[])?.map((e: any) => e.id) || []
  const { data: reportsData } = await (supabase
    .from('reports') as any)
    .select('reported_id')
    .in('reported_id', eventIds)
    .eq('reported_type', 'event')

  const reportCounts = (reportsData as any[])?.reduce((acc: any, curr: any) => {
    acc[curr.reported_id] = (acc[curr.reported_id] || 0) + 1
    return acc
  }, {}) || {}

  const events = reportedOnly
    ? allEvents?.filter((e: any) => reportCounts[e.id] > 0)
    : allEvents

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Event Moderation
            <Calendar className="h-6 w-6 text-indigo-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Quality assurance, ticket tracking, and event lifecycle control.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-px">
        {['all', 'published', 'draft', 'suspended', 'cancelled'].map((s) => (
          <Link
            key={s}
            href={`/admin/events?status=${s}${reportedOnly ? '&reported=true' : ''}`}
            className={cn(
              "px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0",
              status === s
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-white"
            )}
          >
            {s}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-4 my-1">
          <Link
            href={`/admin/events?status=${status}${reportedOnly ? '' : '&reported=true'}`}
            className={cn(
              "px-3.5 py-1.5 text-[10px] font-black rounded-xl border transition-all flex items-center gap-1.5 uppercase tracking-widest shadow-sm",
              reportedOnly
                ? "bg-red-600 text-white border-red-500 shadow-red-500/20"
                : "bg-zinc-900 text-zinc-400 border-white/10 hover:border-red-500/40 hover:text-red-400"
            )}
          >
            <AlertTriangle className={cn("w-3.5 h-3.5", reportedOnly ? "text-white" : "text-amber-400")} />
            Reported Issues
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Event Identity</th>
                <th className="px-6 py-4">Host</th>
                <th className="px-6 py-4">Engagement</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {events && events.length > 0 ? (
                events.map((event: any) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.cover_image_url ? (
                          <img src={event.cover_image_url} alt={event.title} className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10 shadow-md shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 shrink-0">
                            <Calendar className="w-5 h-5 text-zinc-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-white italic truncate max-w-[250px] group-hover:text-indigo-400 transition-colors">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-mono text-zinc-500">Created {new Date(event.created_at).toLocaleDateString()}</p>
                            {reportCounts[event.id] > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-red-950/60 border border-red-500/30 text-red-400 uppercase tracking-widest">
                                {reportCounts[event.id]} Reports
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate max-w-[150px] font-black italic text-zinc-200 group-hover:text-indigo-400 transition-colors">
                          {event.host_page?.display_name || 'SYSTEM'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                          <User className="w-3 h-3" />
                          <span>@{event.host?.username || 'unknown'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-200 font-mono">
                          <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                          {event.booking_count} <span className="text-zinc-500">Tickets</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-200 font-mono">
                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                          {event.views_count} <span className="text-zinc-500">Views</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          event.status === 'published' ? 'success' :
                            event.status === 'suspended' ? 'danger' :
                              'outline'
                        }
                        className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase border-none"
                      >
                        {event.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <EventActionButton
                          eventId={event.id}
                          action="feature"
                          value={!event.is_featured}
                          variant="ghost"
                          className={cn("p-2 rounded-xl transition-all", event.is_featured ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-zinc-500 hover:text-amber-400 hover:bg-white/10")}
                        >
                          <Star className={cn("w-4 h-4", event.is_featured && "fill-current")} />
                        </EventActionButton>

                        {event.status === 'published' ? (
                          <EventActionButton
                            eventId={event.id}
                            action="suspend"
                            variant="danger"
                            className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60"
                          >
                            SUSPEND
                          </EventActionButton>
                        ) : (
                          <EventActionButton
                            eventId={event.id}
                            action="unsuspend"
                            variant="default"
                            className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60"
                          >
                            UNSUSPEND
                          </EventActionButton>
                        )}

                        <Link
                          href={`https://www.cityculture.in/events/${event.slug}`}
                          target="_blank"
                          className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-black italic uppercase tracking-widest">
                    No event listings match this criteria.
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

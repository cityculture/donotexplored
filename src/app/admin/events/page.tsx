import { createClient } from '@/lib/supabase/server'
import EventActionButton from '@/components/admin/EventActionButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  User,
  Eye,
  Ticket,
  AlertTriangle,
  Star,
  ExternalLink,
  Search
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

  // Client-side filtering for reports (for now) and fetching counts
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
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Moderation</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Quality assurance & Event lifecycle control</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-px">
        {['all', 'published', 'draft', 'suspended', 'cancelled'].map((s) => (
          <Link
            key={s}
            href={`/admin/events?status=${s}${reportedOnly ? '&reported=true' : ''}`}
            className={cn(
              "px-4 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all transition-colors",
              status === s
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-900"
            )}
          >
            {s}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-4 mb-3">
          <Link
            href={`/admin/events?status=${status}${reportedOnly ? '' : '&reported=true'}`}
            className={cn(
              "px-4 py-2 text-[10px] font-black rounded-xl border transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm",
              reportedOnly
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-500 border-gray-100 hover:border-red-200 hover:text-red-500"
            )}
          >
            <AlertTriangle className={cn("w-3.5 h-3.5", reportedOnly ? "text-white" : "text-gray-300")} />
            Reported Issues
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-6">Event Identity</th>
                <th className="px-8 py-6">Host</th>
                <th className="px-8 py-6">Engagement metrics</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {events && events.length > 0 ? (
                events.map((event: any) => (
                  <tr key={event.id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {event.cover_image_url ? (
                          <img src={event.cover_image_url} alt={event.title} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-md" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                            <Calendar className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 italic truncate max-w-[250px] hover:text-indigo-600 transition-colors">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Created {new Date(event.created_at).toLocaleDateString()}</p>
                            {reportCounts[event.id] > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-red-100 text-red-700 uppercase tracking-widest">
                                {reportCounts[event.id]} Reports
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate max-w-[150px] font-black italic text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {event.host_page?.display_name || 'SYSTEM'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          <User className="w-3 h-3" />
                          <span>@{event.host?.username || 'unknown'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-950 uppercase tracking-tighter">
                          <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                          {event.booking_count} <span className="text-gray-400">Tickets</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-950 uppercase tracking-tighter">
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                          {event.views_count} <span className="text-gray-400">Views</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge
                        variant={
                          event.status === 'published' ? 'success' :
                            event.status === 'suspended' ? 'danger' :
                              'outline'
                        }
                        className="px-3 py-1 text-[9px] font-black tracking-widest uppercase border-none"
                      >
                        {event.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EventActionButton
                          eventId={event.id}
                          action="feature"
                          value={!event.is_featured}
                          variant="ghost"
                          className={cn("p-2 rounded-xl transition-all", event.is_featured ? "bg-amber-50 text-amber-500 shadow-inner" : "text-gray-200 hover:text-amber-500 hover:bg-amber-50")}
                        >
                          <Star className={cn("w-5 h-5", event.is_featured && "fill-current")} />
                        </EventActionButton>

                        {event.status !== 'published' && (
                          <EventActionButton
                            eventId={event.id}
                            action="approve"
                            variant="outline"
                            className="text-green-600 font-black text-[10px] tracking-widest hover:bg-green-50 border-green-100"
                          >
                            APPROVE
                          </EventActionButton>
                        )}

                        {event.status !== 'suspended' && (
                          <EventActionButton
                            eventId={event.id}
                            action="suspend"
                            variant="outline"
                            className="text-red-500 font-black text-[10px] tracking-widest hover:bg-red-50 border-red-100"
                          >
                            SUSPEND
                          </EventActionButton>
                        )}

                        <Link href={`/events/${event.slug}`} target="_blank">
                          <Button size="sm" variant="ghost" className="text-gray-300 hover:text-indigo-600">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-gray-400 font-black italic uppercase tracking-widest opacity-30">
                    {reportedOnly ? "Clear skies. No issues detected." : "No events match the current filter."}
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

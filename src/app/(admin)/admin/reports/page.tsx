import { createClient } from '@/lib/supabase/server'
import ReportActionButton from '@/components/admin/ReportActionButton'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  CheckCircle, 
  User, 
  Calendar,
  ExternalLink,
  Flag
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const p = await searchParams
  const currentStatus = p.status || 'pending'

  const { data: reports } = await (supabase
    .from('reports') as any)
    .select('*, reporter:users!reporter_id(username)')
    .eq('status', currentStatus)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Content Reports
            <Flag className="h-6 w-6 text-red-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Review and resolve community-flagged content, listings, and users.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-px">
        {['pending', 'under_review', 'resolved', 'dismissed'].map((s) => (
          <Link
            key={s}
            href={`/admin/reports?status=${s}`}
            className={cn(
              "px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0",
              currentStatus === s 
                ? "border-indigo-400 text-indigo-400" 
                : "border-transparent text-zinc-500 hover:text-white"
            )}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports && reports.length > 0 ? (
          reports.map((report: any) => (
            <div key={report.id} className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col transition-all hover:border-white/20">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Status Indicator */}
                <div className={cn(
                  "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border border-white/10",
                  report.status === 'pending' ? "bg-red-950/60 text-red-400 border-red-500/30" : "bg-zinc-900 text-zinc-400"
                )}>
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="font-black text-lg text-white capitalize">{report.reason.replace(/_/g, ' ')}</span>
                       <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-white/10 bg-zinc-900 text-zinc-300">
                        {report.reported_type}
                       </Badge>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 ml-auto">
                        <ReportActionButton reportId={report.id} status="dismissed" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10">
                          Dismiss
                        </ReportActionButton>
                        <ReportActionButton reportId={report.id} status="resolved" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                          Resolve
                        </ReportActionButton>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>By @{report.reporter?.username || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{report.details || 'No details specified.'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">ID: {report.reported_id}</span>
                    </div>
                    
                    {report.reported_type === 'event' && (
                      <Link href={`/admin/events?id=${report.reported_id}`} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1">
                        View Event <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {report.reported_type === 'user' && (
                      <Link href={`/admin/users?id=${report.reported_id}`} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1">
                        View User <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {report.resolution_note && (
                <div className="bg-indigo-950/40 px-6 py-3 border-t border-indigo-500/20">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider mb-0.5">ADMIN RESOLUTION NOTE</p>
                  <p className="text-xs text-indigo-200 font-medium">{report.resolution_note}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center rounded-3xl border border-white/10 bg-zinc-950/50 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-emerald-400/40 mb-3" />
            <h3 className="text-base font-bold text-zinc-300">All clear! No pending reports.</h3>
            <p className="text-xs text-zinc-500 mt-1">Check back later or review resolved items.</p>
          </div>
        )}
      </div>
    </div>
  )
}

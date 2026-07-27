import { createClient } from '@/lib/supabase/server'
import ReportActionButton from '@/components/admin/ReportActionButton'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  CheckCircle, 
  User, 
  Calendar,
  ExternalLink
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Reports</h1>
          <p className="text-gray-500 text-sm">Review and resolve community-flagged content.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-zinc-800">
        {['pending', 'under_review', 'resolved', 'dismissed'].map((s) => (
          <Link
            key={s}
            href={`/admin/reports?status=${s}`}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize",
              currentStatus === s 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports && reports.length > 0 ? (
          reports.map((report: any) => (
            <div key={report.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Status Indicator */}
                <div className={cn(
                  "w-12 h-12 rounded-full shrink-0 flex items-center justify-center",
                  report.status === 'pending' ? "bg-red-50 text-red-600 dark:bg-red-900/10" : "bg-gray-100 text-gray-600 dark:bg-zinc-800"
                )}>
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="font-bold text-lg capitalize">{report.reason.replace(/_/g, ' ')}</span>
                       <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{report.reported_type}</Badge>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 ml-auto">
                        <ReportActionButton reportId={report.id} status="dismissed" variant="ghost" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                          Dismiss
                        </ReportActionButton>
                        <ReportActionButton reportId={report.id} status="resolved">
                          Resolve
                        </ReportActionButton>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5" />
                      <span>By @{report.reporter?.username || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      "{report.details || 'No details specified.'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {report.reported_id}</span>
                    </div>
                    
                    {report.reported_type === 'event' && (
                      <Link href={`/admin/events?id=${report.reported_id}`} className="text-indigo-600 hover:underline text-xs font-semibold flex items-center gap-1">
                        View Event <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {report.reported_type === 'user' && (
                      <Link href={`/admin/users?id=${report.reported_id}`} className="text-indigo-600 hover:underline text-xs font-semibold flex items-center gap-1">
                        View User <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {report.resolution_note && (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 px-6 py-3 border-t border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mb-0.5">ADMIN RESOLUTION</p>
                  <p className="text-sm text-indigo-900 dark:text-indigo-300 font-medium">{report.resolution_note}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-24 text-center rounded-2xl border-2 border-dashed border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/30 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-100 dark:text-green-900/20 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">All clear! No pending reports.</h3>
            <p className="text-sm text-gray-400 mt-1">Check back later or review resolved items.</p>
          </div>
        )}
      </div>
    </div>
  )
}

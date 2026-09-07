import { createClient } from '@/lib/supabase/server'
import { AuditLogTable } from '@/components/admin/AuditLogTable'
import { 
  History, 
  ChevronLeft,
  ChevronRight,
  Database,
  User as UserIcon,
  Calendar,
  Ticket
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string, page?: string }>
}) {
  const supabase = await createClient()
  const p = await searchParams
  const entity = p.entity || 'all'
  const currentPage = parseInt(p.page || '1')
  const pageSize = 50

  let query = (supabase
    .from('audit_logs') as any)
    .select('*, actor:users!actor_id(username)')
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

  if (entity !== 'all') query = query.eq('entity_type', entity)

  const { data: logs } = await query

  const entities = [
    { label: 'ALL', value: 'all', icon: History },
    { label: 'USERS', value: 'user', icon: UserIcon },
    { label: 'EVENTS', value: 'event', icon: Calendar },
    { label: 'BOOKINGS', value: 'booking', icon: Ticket },
    { label: 'SCHEMA', value: 'host_profile', icon: Database },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Audit Registry
            <History className="h-6 w-6 text-indigo-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Verified historical log of all application security events and data mutations.
          </p>
        </div>
        
        <div className="flex bg-zinc-900/80 rounded-2xl p-1 border border-white/10 overflow-x-auto max-w-full">
          {entities.map((ent) => {
            const Icon = ent.icon
            return (
              <Link
                key={ent.value}
                href={`/admin/audit-logs?entity=${ent.value}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all whitespace-nowrap",
                  entity === ent.value 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {ent.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[500px]">
        <AuditLogTable logs={logs || []} />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
         <div className="flex flex-col">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Pagination Control</p>
            <p className="text-xs text-zinc-400 font-bold italic mt-0.5">
              Page <span className="text-indigo-400 not-italic font-mono">{currentPage}</span> of platform registry
            </p>
         </div>
         <div className="flex items-center gap-3">
           <Link 
             href={`/admin/audit-logs?page=${Math.max(1, currentPage - 1)}${entity !== 'all' ? `&entity=${entity}` : ''}`}
             className={cn(
               "w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-white/10 transition-all",
               currentPage === 1 && "opacity-30 pointer-events-none"
             )}
           >
             <ChevronLeft className="w-5 h-5" />
           </Link>
           <Link 
             href={`/admin/audit-logs?page=${currentPage + 1}${entity !== 'all' ? `&entity=${entity}` : ''}`}
             className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
           >
             <ChevronRight className="w-5 h-5" />
           </Link>
         </div>
      </div>
    </div>
  )
}

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
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Audit Registry</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Verified historical log of all application mutations</p>
        </div>
        
        <div className="flex bg-gray-50 rounded-2xl p-1.5 border border-gray-100 shadow-inner overflow-x-auto max-w-full no-scrollbar">
          {entities.map((ent) => {
            const Icon = ent.icon
            return (
              <Link
                key={ent.value}
                href={`/admin/audit-logs?entity=${ent.value}`}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all whitespace-nowrap",
                  entity === ent.value 
                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100/50" 
                    : "text-gray-400 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {ent.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden mb-12 min-h-[600px]">
        <AuditLogTable logs={logs || []} />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pb-32 pt-8 border-t border-gray-50">
         <div className="flex flex-col">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Pagination Control</p>
            <p className="text-xs text-gray-500 font-black italic">
              Page <span className="text-indigo-600 not-italic">{currentPage}</span> of the platform registry
            </p>
         </div>
         <div className="flex items-center gap-4">
           <Link 
             href={`/admin/audit-logs?page=${Math.max(1, currentPage - 1)}${entity !== 'all' ? `&entity=${entity}` : ''}`}
             className={cn(
               "w-14 h-14 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all shadow-lg shadow-gray-100 group",
               currentPage === 1 && "opacity-30 pointer-events-none"
             )}
           >
             <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
           </Link>
           <Link 
             href={`/admin/audit-logs?page=${currentPage + 1}${entity !== 'all' ? `&entity=${entity}` : ''}`}
             className="w-14 h-14 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all shadow-lg shadow-gray-100 hover:scale-105 group"
           >
             <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
           </Link>
         </div>
      </div>
    </div>
  )
}

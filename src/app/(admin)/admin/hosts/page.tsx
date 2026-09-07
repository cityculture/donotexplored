import { createClient } from '@/lib/supabase/server'
import HostActionButton from '@/components/admin/HostActionButton'
import VerifyHostButton from '@/components/admin/VerifyHostButton'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import HostDetailsModal from '@/components/admin/HostDetailsModal'

export const dynamic = 'force-dynamic'

export default async function AdminHostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const p = await searchParams
  const status = p.status || 'all'

  let query = (supabase
    .from('host_pages') as any)
    .select('*, user:users!user_id(email, is_verified)')
    .order('created_at', { ascending: false })

  if (status === 'pending') query = query.eq('is_approved', false)
  else if (status === 'approved') query = query.eq('is_approved', true)
  else if (status === 'rejected') query = query.eq('kyc_status', 'rejected')

  const { data: hosts } = await query

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Host Control
            <ShieldCheck className="h-6 w-6 text-emerald-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Verify and manage platform event organizers and KYC credentials.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-px overflow-x-auto">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <Link
            key={s}
            href={`/admin/hosts?status=${s}`}
            className={cn(
              "px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0",
              status === s
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-white hover:border-white/20"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Host Details</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">KYC / Verify</th>
                <th className="px-6 py-4">Approval Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {hosts && hosts.length > 0 ? (
                hosts.map((host: any) => (
                  <tr key={host.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black uppercase italic shrink-0">
                          {host.display_name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white italic truncate max-w-[200px]">{host.display_name}</p>
                          <p className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px]">{host.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{host.host_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Badge
                          variant={
                            host.kyc_status === 'verified' ? 'success' :
                              host.kyc_status === 'rejected' ? 'danger' :
                                'warning'
                          }
                          className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase border-none w-fit"
                        >
                          KYC: {host.kyc_status}
                        </Badge>
                        {host.user?.is_verified && (
                          <div className="flex items-center gap-1 text-indigo-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">VERIFIED</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {host.is_approved ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[10px] uppercase tracking-tighter">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-400 font-black text-[10px] uppercase tracking-tighter">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <VerifyHostButton 
                          hostId={host.id} 
                          isVerified={!!host.user?.is_verified} 
                          className="shadow-sm hover:scale-105 transition-transform"
                        />
                        {!host.is_approved ? (
                          <HostActionButton hostId={host.id} approved={true} className="shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                            APPROVE
                          </HostActionButton>
                        ) : (
                          <HostActionButton
                            hostId={host.id}
                            approved={false}
                            variant="outline"
                            className="text-red-400 font-black text-[10px] tracking-widest hover:bg-red-950/40 border-red-500/30"
                          >
                            REVOKE
                          </HostActionButton>
                        )}
                        <HostDetailsModal host={host} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-black italic uppercase tracking-widest">
                    No hosts found in this filter category.
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
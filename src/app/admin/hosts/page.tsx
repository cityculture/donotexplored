import { createClient } from '@/lib/supabase/server'
import HostActionButton from '@/components/admin/HostActionButton'
import VerifyHostButton from '@/components/admin/VerifyHostButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Mail
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
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Host Control</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Verify and Manage Platform Organisers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 border-b border-gray-100 pb-px">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <Link
            key={s}
            href={`/admin/hosts?status=${s}`}
            className={cn(
              "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all transition-colors",
              status === s
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-200"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-6">Host Details</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6">KYC/Verify</th>
                <th className="px-8 py-6">Approval</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {hosts && hosts.length > 0 ? (
                hosts.map((host: any) => (
                  <tr key={host.id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black uppercase italic shrink-0">
                          {host.display_name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 italic truncate max-w-[200px]">{host.display_name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[200px]">{host.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{host.host_type}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <Badge
                          variant={
                            host.kyc_status === 'verified' ? 'success' :
                              host.kyc_status === 'rejected' ? 'danger' :
                                'warning'
                          }
                          className="px-3 py-1 text-[10px] font-black tracking-widest uppercase border-none w-fit"
                        >
                          KYC: {host.kyc_status}
                        </Badge>
                        {host.user?.is_verified && (
                          <div className="flex items-center gap-1.5 text-indigo-600">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">SM VERIFIED</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {host.is_approved ? (
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-tighter">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-tighter">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span>Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <VerifyHostButton 
                          hostId={host.id} 
                          isVerified={!!host.user?.is_verified} 
                          className="shadow-sm hover:scale-105 transition-transform"
                        />
                        {!host.is_approved ? (
                          <HostActionButton hostId={host.id} approved={true} className="shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">
                            APPROVE
                          </HostActionButton>
                        ) : (
                          <HostActionButton
                            hostId={host.id}
                            approved={false}
                            variant="outline"
                            className="text-red-600 font-black text-[10px] tracking-widest hover:bg-red-50 border-red-100"
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
                  <td colSpan={5} className="px-8 py-32 text-center text-gray-400 font-black italic uppercase tracking-widest opacity-30">
                    Host roster is currently empty.
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
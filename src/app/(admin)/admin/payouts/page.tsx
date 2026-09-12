import { createClient } from '@/lib/supabase/server'
import PayoutActionButton from '@/components/admin/PayoutActionButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CreditCard,
  User,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const p = await searchParams
  const currentStatus = p.status || 'pending'

  const { data: payouts } = await (supabase
    .from('payouts') as any)
    .select('*, host:users(username, email, id, full_name), event:events(title)')
    .eq('status', currentStatus)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Financial Control
            <CreditCard className="h-6 w-6 text-amber-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Verify and execute payout settlements to platform hosts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/10 pb-px overflow-x-auto">
        {['pending', 'processing', 'paid', 'failed', 'on_hold'].map((s) => (
          <Link
            key={s}
            href={`/admin/payouts?status=${s}`}
            className={cn(
              "px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0",
              currentStatus === s 
                ? "border-indigo-400 text-indigo-400" 
                : "border-transparent text-zinc-500 hover:text-white"
            )}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Host / Event</th>
                <th className="px-6 py-4">Settlement Target</th>
                <th className="px-6 py-4">Net Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {payouts && payouts.length > 0 ? (
                payouts.map((payout: any) => (
                  <tr key={payout.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                             <User className="w-3.5 h-3.5 text-zinc-400" />
                           </div>
                           <span className="font-black text-white italic">@{payout.host?.username || 'Unknown'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                           {payout.event?.title || 'User Balance Settlement'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payout.host ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{payout.host.full_name || payout.host.username}</span>
                          <span className="text-[9px] font-mono text-zinc-500">ID: {payout.host.id}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest italic">No page linked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xl font-black font-mono tracking-tighter text-emerald-400 italic">
                        <span className="text-xs opacity-40 not-italic">₹</span>
                        {Number(payout.net_amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={
                          payout.status === 'paid' ? 'success' : 
                          payout.status === 'failed' ? 'danger' : 
                          'warning'
                        }
                        className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase border-none"
                      >
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payout.status === 'pending' && (
                          <PayoutActionButton payoutId={payout.id} className="shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                            PROCESS
                          </PayoutActionButton>
                        )}
                        <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white hover:bg-white/10">
                           <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-black italic uppercase tracking-widest">
                    No payouts matching this criteria.
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

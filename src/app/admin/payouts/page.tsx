import { createClient } from '@/lib/supabase/server'
import PayoutActionButton from '@/components/admin/PayoutActionButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Banknote, 
  Clock, 
  CheckCircle, 
  Calendar,
  User,
  ExternalLink,
  ChevronRight
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
    .select('*, host:users(username, email, host_pages(id, display_name)), event:events(title)')
    .eq('status', currentStatus)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Financial Control</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Verify and execute settlements to platform hosts</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-100 pb-px overflow-x-auto">
        {['pending', 'processing', 'paid', 'failed', 'on_hold'].map((s) => (
          <Link
            key={s}
            href={`/admin/payouts?status=${s}`}
            className={cn(
              "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all transition-colors whitespace-nowrap",
              currentStatus === s 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-200"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-6">Host / Event</th>
                <th className="px-8 py-6">Settlement Target</th>
                <th className="px-8 py-6">Net Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {payouts && payouts.length > 0 ? (
                payouts.map((payout: any) => (
                  <tr key={payout.id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                             <User className="w-4 h-4 text-gray-400" />
                           </div>
                           <span className="font-black text-gray-900 italic">@{payout.host?.username || 'Unknown'}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                           {payout.event?.title || 'User Balance Settlement'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {payout.host?.host_pages?.[0] ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Host Page</span>
                          <span className="text-xs font-bold text-gray-900">{payout.host.host_pages[0].display_name}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID: {payout.host.host_pages[0].id}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest italic">No page linked</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1 text-2xl font-black tracking-tighter text-gray-900 italic">
                        <span className="text-sm opacity-30 not-italic">₹</span>
                        {Number(payout.net_amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge 
                        variant={
                          payout.status === 'paid' ? 'success' : 
                          payout.status === 'failed' ? 'danger' : 
                          'warning'
                        }
                        className="px-3 py-1 text-[10px] font-black tracking-widest uppercase border-none"
                      >
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {payout.status === 'pending' && (
                          <PayoutActionButton payoutId={payout.id} className="shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">
                            PROCESS
                          </PayoutActionButton>
                        )}
                        <Button size="sm" variant="ghost" className="text-gray-300 hover:text-indigo-600">
                           <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-gray-400 font-black italic uppercase tracking-widest opacity-30">
                    No settlements pending.
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

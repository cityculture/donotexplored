import { createClient } from '@/lib/supabase/server'
import UserActionButton from '@/components/admin/UserActionButton'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search,
  CheckCircle,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, role?: string }>
}) {
  const supabase = await createClient()
  const p = await searchParams
  const queryParam = p.q || ''
  const roleParam = p.role || 'all'

  let query = (supabase
    .from('users') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (queryParam) {
    query = query.or(`email.ilike.%${queryParam}%,username.ilike.%${queryParam}%`)
  }
  
  if (roleParam !== 'all') {
    query = query.eq('role', roleParam)
  }

  const { data: users } = await query

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            User Control
            <Users className="h-6 w-6 text-purple-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Directory of platform explorers, hosts, and accounts.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <form className="relative group w-full md:w-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              name="q"
              type="text" 
              placeholder="Search by email or username..." 
              defaultValue={queryParam}
              className="pl-10 pr-4 py-2.5 text-xs font-mono rounded-xl border border-white/10 bg-zinc-900/80 focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all outline-none w-full md:w-80 text-white placeholder:text-zinc-500 shadow-xl"
            />
          </form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-px">
        {['all', 'member', 'host', 'admin', 'moderator'].map((r) => (
          <Link
            key={r}
            href={`/admin/users?role=${r}${queryParam ? `&q=${queryParam}` : ''}`}
            className={cn(
              "px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0",
              roleParam === r 
                ? "border-indigo-400 text-indigo-400" 
                : "border-transparent text-zinc-500 hover:text-white"
            )}
          >
            {r}
          </Link>
        ))}
      </div>

      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">User Presence</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Trust & Verification</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-indigo-400 font-black uppercase overflow-hidden shrink-0 shadow-sm italic text-xs font-mono">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user.username?.substring(0, 2) || 'US'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white italic truncate max-w-[200px]">@{user.username}</p>
                          <p className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border-white/10 bg-zinc-900 text-zinc-300">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.is_verified ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-black text-[10px] uppercase tracking-tighter">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_suspended ? (
                        <div className="flex items-center gap-1.5 text-red-400 font-black text-[10px] uppercase tracking-tighter">
                          <AlertOctagon className="w-4 h-4" />
                          <span>Suspended</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[10px] uppercase tracking-tighter">
                          <CheckCircle className="w-4 h-4" />
                          <span>Active</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.is_suspended ? (
                          <UserActionButton
                            userId={user.id}
                            action="unsuspend"
                            variant="outline"
                            className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40 text-[10px] font-black uppercase tracking-widest px-3 py-1"
                          >
                            UNSUSPEND
                          </UserActionButton>
                        ) : (
                          <UserActionButton
                            userId={user.id}
                            action="suspend"
                            variant="danger"
                            className="bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 text-[10px] font-black uppercase tracking-widest px-3 py-1"
                          >
                            SUSPEND
                          </UserActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-black italic uppercase tracking-widest">
                    No users matching search criteria.
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

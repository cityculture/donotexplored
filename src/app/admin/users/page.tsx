import { createClient } from '@/lib/supabase/server'
import UserActionButton from '@/components/admin/UserActionButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Search,
  CheckCircle,
  MoreVertical,
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
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Users</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Directory of Platform explorers & curators</p>
        </div>
        
        <div className="flex items-center gap-4">
           <form className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                name="q"
                type="text" 
                placeholder="Search by email or name..." 
                defaultValue={queryParam}
                className="pl-12 pr-6 py-3 text-sm font-black italic rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none w-64 md:w-96 shadow-xl shadow-gray-50 text-gray-950 placeholder:text-gray-300 placeholder:italic whitespace-nowrap"
              />
           </form>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 pb-px">
        {['all', 'member', 'host', 'admin', 'moderator'].map((r) => (
          <Link
            key={r}
            href={`/admin/users?role=${r}${queryParam ? `&q=${queryParam}` : ''}`}
            className={cn(
              "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
              roleParam === r 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-400 hover:text-gray-900"
            )}
          >
            {r}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-6">User Presence</th>
                <th className="px-8 py-6">System Role</th>
                <th className="px-8 py-6">Trust & Verification</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-black uppercase overflow-hidden shrink-0 shadow-sm italic text-sm">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user.username.substring(0, 2)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-950 italic truncate max-w-[150px]">@{user.username}</p>
                          <p className="text-[10px] font-bold text-gray-400 truncate max-w-[180px] uppercase tracking-tighter">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : user.role === 'host' ? 'secondary' : 'outline'} 
                        className={cn(
                          "uppercase px-3 py-1 rounded-full font-black tracking-widest text-[9px] border-none shadow-sm",
                          user.role === 'admin' && "bg-indigo-600 text-white",
                          user.role === 'host' && "bg-purple-600 text-white",
                          user.role === 'member' && "bg-gray-50 text-gray-500 border border-gray-100"
                        )}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      {user.is_verified ? (
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Platform Verified</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic opacity-50">Discovery phase</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {user.is_suspended ? (
                        <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                           <AlertOctagon className="w-4 h-4" />
                           <span>Suspended</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                           <CheckCircle className="w-4 h-4" />
                           <span>Active Access</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!user.is_suspended && user.role !== 'admin' && (
                          <UserActionButton userId={user.id} action="suspend" variant="outline" className="text-red-600 font-black text-[9px] h-8 px-4 tracking-widest hover:bg-red-50 border-red-100 uppercase">
                            SUSPEND ACCESS
                          </UserActionButton>
                        )}
                        <Button size="sm" variant="ghost" className="text-gray-300 hover:text-gray-600 h-8 w-10 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center flex flex-col items-center opacity-30">
                    <Search className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-gray-400 font-black uppercase tracking-widest italic">No matching identities found.</p>
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


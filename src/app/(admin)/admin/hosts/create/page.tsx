import { fetchFromBackend } from '@/lib/backendClient'
import { createHostProfileAdminAction } from './actions'
import Link from 'next/link'
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import CreateHostProfileFormClient from './CreateHostProfileFormClient'

export const dynamic = 'force-dynamic'

export default async function AdminCreateHostPage() {
  let activeUsers: any[] = []
  try {
    activeUsers = await fetchFromBackend('/api/admin/users/active')
  } catch (error) {
    console.error('Failed to load active users for host creation dropdown:', error)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-6">
        <div className="space-y-1">
          <Link 
            href="/admin/hosts" 
            className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Host Control
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8 mt-2">New Host Page</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Provision and authorize a new systems host profile</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex gap-4">
        <ShieldAlert className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-indigo-900">
          <h4 className="font-black uppercase text-sm">Administrative Authority</h4>
          <p className="text-xs font-bold leading-relaxed opacity-90 uppercase tracking-tighter">
            Creating a host profile here bypasses the payment subscription wall and standard approval phase. The host profile will be auto-approved with verified KYC instantly, and the user's system role will be updated to "host".
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 p-10">
        <CreateHostProfileFormClient activeUsers={activeUsers} action={createHostProfileAdminAction} />
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Save, Shield, Database, Settings, AlertTriangle } from 'lucide-react'
import { updatePlatformConfigAction } from '@/actions/admin.actions'

export const dynamic = 'force-dynamic'

export default async function AdminConfigPage() {
  const supabase = await createClient()

  const { data: configs } = await (supabase
    .from('platform_config') as any)
    .select('*')
    .order('key', { ascending: true })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Registry Control
            <Settings className="h-6 w-6 text-indigo-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Global platform parameters, architectural constants, and system rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
           {configs?.map((config: any) => (
             <div key={config.key} className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl p-6 shadow-xl transition-all hover:border-white/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <Database className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-base font-black text-white italic uppercase tracking-tight">{config.key.replace(/_/g, ' ')}</h3>
                      </div>
                      <p className="text-xs font-medium text-zinc-400">{config.description || 'System constant defined in database registry.'}</p>
                   </div>
                   
                   <form action={async (formData: FormData) => {
                     'use server'
                     const newValue = formData.get('value') as string
                     await updatePlatformConfigAction(config.key, newValue)
                   }} className="flex items-center gap-3">
                      <input 
                        name="value"
                        type="text" 
                        defaultValue={config.value}
                        className="px-4 py-2.5 bg-zinc-900 border border-white/10 focus:border-indigo-400 rounded-xl outline-none font-mono text-xs text-white w-full md:w-60 transition-all shadow-inner"
                      />
                      <button type="submit" className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
                         <Save className="w-4 h-4" />
                      </button>
                   </form>
                </div>
             </div>
           ))}
           
           {(!configs || configs.length === 0) && (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl">
                 <p className="text-zinc-500 font-mono text-xs uppercase">No configuration keys detected.</p>
              </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="p-6 bg-indigo-950/40 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
              <Shield className="absolute -right-4 -bottom-4 w-28 h-28 text-indigo-500/10 -rotate-12" />
              <div className="relative z-10">
                 <h4 className="font-black text-indigo-300 italic uppercase mb-1">Architectural Safety</h4>
                 <p className="text-xs text-indigo-200/80 leading-relaxed font-medium">
                   Modification of these constants affects critical calculations including platform fees, ticket limits, and global visibility rules.
                 </p>
              </div>
           </div>

           <div className="p-6 bg-amber-950/40 rounded-3xl border border-amber-500/20">
              <div className="flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="font-black text-amber-300 italic uppercase mb-1">Caution Required</h4>
                    <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                      Changes persist immediately across the platform. Verification in sandbox recommended for fee adjustments.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

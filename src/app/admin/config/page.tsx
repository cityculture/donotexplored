import { createClient } from '@/lib/supabase/server'
import { Save, Shield, Database, Globe, AlertTriangle } from 'lucide-react'
import { updatePlatformConfigAction } from '@/actions/admin.actions'

export const dynamic = 'force-dynamic'

export default async function AdminConfigPage() {
  const supabase = await createClient()

  const { data: configs } = await (supabase
    .from('platform_config') as any)
    .select('*')
    .order('key', { ascending: true })

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Registry Control</h1>
        <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Global platform parameters and architectural constants</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-6">
           {configs?.map((config: any) => (
             <div key={config.key} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 group transition-all hover:scale-[1.01]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Database className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-lg font-black text-gray-950 italic uppercase tracking-tighter">{config.key.replace(/_/g, ' ')}</h3>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{config.description || 'System constant defined in database registry.'}</p>
                   </div>
                   
                   <form action={async (formData: FormData) => {
                     'use server'
                     const newValue = formData.get('value') as string
                     await updatePlatformConfigAction(config.key, newValue)
                   }} className="flex items-center gap-4">
                      <input 
                        name="value"
                        type="text" 
                        defaultValue={config.value}
                        className="px-6 py-4 bg-gray-50 border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl outline-none font-black italic text-gray-900 w-full md:w-64 transition-all shadow-inner"
                      />
                      <button type="submit" className="w-14 h-14 flex items-center justify-center bg-gray-950 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-100">
                         <Save className="w-6 h-6" />
                      </button>
                   </form>
                </div>
             </div>
           ))}
           
           {(!configs || configs.length === 0) && (
              <div className="p-20 text-center border-4 border-dashed border-gray-100 rounded-[3rem]">
                 <p className="text-gray-300 font-black italic uppercase tracking-[0.2em]">No configuration keys detected.</p>
              </div>
           )}
        </div>

        <div className="space-y-8">
           <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden group">
              <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-200/50 -rotate-12 transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                 <h4 className="font-black text-indigo-900 italic uppercase mb-2">Architectural Safety</h4>
                 <p className="text-xs text-indigo-600 font-bold leading-relaxed uppercase tracking-tighter">
                   Modification of these constants affects critical calculations including platform fees, ticket limits, and global visibility rules.
                 </p>
              </div>
           </div>

           <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
              <div className="flex items-start gap-4">
                 <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                 <div>
                    <h4 className="font-black text-amber-900 italic uppercase mb-2">Caution Required</h4>
                    <p className="text-xs text-amber-700 font-bold leading-relaxed opacity-80">
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

import { createClient } from '@/lib/supabase/server'
import { manageFeaturedSlotAction } from '@/actions/admin.actions'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, Star, Tv, MapPin, Tag, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturedPage() {
  const supabase = await createClient()

  const { data: events } = await (supabase
    .from('events') as any)
    .select('id, title, is_featured, is_sponsored, start_datetime, city, featured_slots(*)')
    .eq('status', 'published')
    .order('start_datetime', { ascending: false })
    .limit(50)

  const slotTypes = [
    { label: 'None', value: 'none', icon: null },
    { label: 'Hero', value: 'homepage_hero', icon: Tv },
    { label: 'Grid', value: 'homepage_grid', icon: LayoutDashboard },
    { label: 'City', value: 'city_top', icon: MapPin },
    { label: 'Cat', value: 'category_top', icon: Tag },
    { label: 'Ads', value: 'sponsored', icon: Star },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Spotlight Control
            <Sparkles className="h-6 w-6 text-indigo-400 inline" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Manage featured slots, hero banners, and sponsored event placements.
          </p>
        </div>
      </div>
      
      <div className="rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-widest text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Event Details</th>
                <th className="px-6 py-4">Current Placement</th>
                <th className="px-6 py-4 text-right">Assign Slot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {(events as any[])?.map((event: any) => {
                const currentSlot = event.featured_slots?.[0]
                return (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-black text-white italic truncate max-w-[250px]">{event.title}</div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(event.start_datetime).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {event.city}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       {currentSlot ? (
                         <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                           {currentSlot.slot_type.replace('_', ' ')}
                         </Badge>
                       ) : (
                         <span className="text-[10px] text-zinc-500 font-mono italic">Standard listing</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                         {slotTypes.map((slot) => (
                           <form key={slot.value} action={async () => {
                             'use server'
                             await manageFeaturedSlotAction(event.id, slot.value as any)
                           }}>
                             <button 
                               type="submit"
                               title={slot.label}
                               className={cn(
                                 "w-8 h-8 flex items-center justify-center rounded-xl border transition-all text-[10px] font-black cursor-pointer",
                                 currentSlot?.slot_type === slot.value || (slot.value === 'none' && !currentSlot)
                                   ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                                   : "bg-zinc-900 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                               )}
                             >
                               {slot.icon ? <slot.icon className="w-3.5 h-3.5" /> : 'X'}
                             </button>
                           </form>
                         ))}
                       </div>
                    </td>
                  </tr>
                )
              })}
              {(!events || events.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-zinc-500 font-black italic uppercase tracking-widest">
                    No active inventory to manage.
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

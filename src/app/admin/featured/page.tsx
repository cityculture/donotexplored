import { createClient } from '@/lib/supabase/server'
import { toggleFeaturedEvent, toggleSponsoredEvent, manageFeaturedSlotAction } from '@/actions/admin.actions'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, Star, Tv, MapPin, Tag } from 'lucide-react'
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
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic underline decoration-indigo-500 underline-offset-8">Spotlight Control</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Manage featured and sponsored event inventory</p>
        </div>
      </div>
      
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-6">Event Details</th>
                <th className="px-8 py-6">Current Slots</th>
                <th className="px-8 py-6 text-right">Assign Slot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {(events as any[])?.map((event: any) => {
                const currentSlot = event.featured_slots?.[0]
                return (
                  <tr key={event.id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900 italic truncate max-w-[250px]">{event.title}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {new Date(event.start_datetime).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {event.city}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       {currentSlot ? (
                         <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                           {currentSlot.slot_type.replace('_', ' ')}
                         </Badge>
                       ) : (
                         <span className="text-[10px] text-gray-300 font-black italic uppercase tracking-widest opacity-50">Standard listing</span>
                       )}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         {slotTypes.map((slot) => (
                           <form key={slot.value} action={async () => {
                             'use server'
                             await manageFeaturedSlotAction(event.id, slot.value as any)
                           }}>
                             <button 
                               type="submit"
                               title={slot.label}
                               className={cn(
                                 "w-10 h-10 flex items-center justify-center rounded-xl border transition-all text-[10px] font-black",
                                 currentSlot?.slot_type === slot.value || (slot.value === 'none' && !currentSlot)
                                   ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                                   : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-indigo-200 hover:text-indigo-600"
                               )}
                             >
                               {slot.icon ? <slot.icon className="w-4 h-4" /> : 'X'}
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
                  <td colSpan={3} className="px-8 py-32 text-center text-gray-400 font-black italic uppercase tracking-widest opacity-30">
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

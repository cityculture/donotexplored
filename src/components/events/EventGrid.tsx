import { EventCard } from './EventCard'
import { EventWithDetails } from '@/types/api.types'

interface EventGridProps {
  events: EventWithDetails[]
  loading?: boolean
  emptyMessage?: string
}

export function EventGrid({ events, loading, emptyMessage = 'No events found.' }: EventGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white animate-pulse">
             <div className="relative w-full overflow-hidden">
               <div className="block sm:hidden aspect-[4/5] w-full bg-gray-200" />
               <div className="hidden sm:block aspect-[2/1] w-full bg-gray-200" />
             </div>
             <div className="p-3 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between pt-2 border-t border-gray-50">
                   <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
                   <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
                </div>
             </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
           <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
           </svg>
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-950">No events found</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

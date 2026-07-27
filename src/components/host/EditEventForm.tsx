'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEventSchema, updateEventSchema, type CreateEventInput } from '@/lib/validations/event.schemas'
import { updateEventAction, uploadEventImageAction } from '@/actions/event.actions'
import { Database } from '@/types/database.types'

interface Category {
  id: string
  name: string
  slug: string
}

interface TicketTier {
  id?: string
  name: string
  tier_type: 'free' | 'paid' | 'donation'
  tier_category: string
  price: number
  total_quantity: number
  max_per_booking: number
}

interface EditEventFormProps {
  event: Database['public']['Tables']['events']['Row']
  categories: Category[]
  ticketTiers: TicketTier[]
}

const steps = ['Basics', 'Schedule', 'Location', 'Tickets']

export function EditEventForm({ event, categories, ticketTiers }: EditEventFormProps) {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<Partial<CreateEventInput>>({
    title: event.title ?? '',
    category_id: event.category_id ?? '',
    event_type: (event.event_type ?? 'in_person') as CreateEventInput['event_type'],
    ticketing_mode: (event.ticketing_mode ?? 'platform') as CreateEventInput['ticketing_mode'],
    start_datetime: event.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
    end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
    timezone: event.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_recurring: event.is_recurring ?? false,
    short_description: event.short_description ?? '',
    description: event.description ?? '',
    cover_image_url: event.cover_image_url ?? '',
    vertical_poster_url: (event as unknown as { vertical_poster_url: string }).vertical_poster_url ?? '',
    is_age_restricted: event.is_age_restricted ?? false,
    min_age: event.min_age ?? null,
    refund_policy: (event.refund_policy ?? 'no_refund') as CreateEventInput['refund_policy'],
    refund_policy_text: event.refund_policy_text ?? '',
    status: (event.status ?? 'published') as CreateEventInput['status'],
    ticket_tiers: ticketTiers.map(t => ({
       name: t.name,
       tier_type: t.tier_type,
       tier_category: (t.tier_category || 'general') as NonNullable<CreateEventInput['ticket_tiers']>[number]['tier_category'],
       price: t.price,
       total_quantity: t.total_quantity,
       max_per_booking: t.max_per_booking
    }))
  })

  const handleNext = () => {
    setCurrentStep(s => Math.min(s + 1, steps.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = <K extends keyof CreateEventInput>(field: K, value: CreateEventInput[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
         ...(prev.location || {}),
         [field]: value
      }
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image_url' | 'vertical_poster_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setErrorMsg(null)
    
    const res = await uploadEventImageAction(event.id, file)
    if (res.error) {
      setErrorMsg(res.error)
    } else if (res.url) {
      handleChange(field, res.url)
    }
    setIsUploading(false)
  }

   const addTicketTier = () => {
      setFormData(prev => ({
        ...prev,
        ticket_tiers: [
          ...(prev.ticket_tiers || []),
          { name: '', tier_type: 'paid', tier_category: 'general', price: 0, total_quantity: 100, max_per_booking: 10 }
        ]
      }))
   }

  const removeTicketTier = (index: number) => {
     setFormData(prev => {
        const tiers = [...(prev.ticket_tiers || [])]
        tiers.splice(index, 1)
        return { ...prev, ticket_tiers: tiers }
     })
  }

  const handleTierChange = <K extends keyof NonNullable<CreateEventInput['ticket_tiers']>[number]>(
    index: number, 
    field: K, 
    value: NonNullable<CreateEventInput['ticket_tiers']>[number][K]
  ) => {
      setFormData(prev => {
         const tiers = [...(prev.ticket_tiers || [])]
         tiers[index] = { ...tiers[index], [field]: value } as NonNullable<CreateEventInput['ticket_tiers']>[number]
         return { ...prev, ticket_tiers: tiers }
      })
  }

  const submitForm = async (status: 'draft' | 'published') => {
    setErrorMsg(null)
    setIsSubmitting(true)
    
    try {
       let start = formData.start_datetime
       let end = formData.end_datetime
       
       if (start && typeof start === 'string' && start.length === 16) start = new Date(start).toISOString()
       if (end && typeof end === 'string' && end.length === 16) end = new Date(end).toISOString()

       const finalPayload = { ...formData, status, start_datetime: start, end_datetime: end }
       const parsed = updateEventSchema.parse(finalPayload)
       
       const builtFormData = new FormData()
       builtFormData.append('data', JSON.stringify(parsed))

       const res = await updateEventAction(event.id, builtFormData)
       if (res?.error) throw new Error(res.error)
       
       router.push(`/members/host-dashboard/${event.host_page_id}/events?success=${event.id}`)
    } catch (err: unknown) {
       console.error(err)
       setErrorMsg(err instanceof Error ? err.message : 'Failed to update event.')
    } finally {
       setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
      
      <div>
        <h1 className="text-2xl font-black text-gray-900">Edit Event</h1>
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, idx) => (
            <button 
              key={step} 
              onClick={() => setCurrentStep(idx)}
              className="flex flex-1 flex-col items-center"
            >
               <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors ${idx === currentStep ? 'bg-indigo-600 text-white' : idx < currentStep ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                 {idx + 1}
               </div>
               <span className={`mt-2 text-xs font-semibold ${idx === currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>
                 {step}
               </span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {errorMsg && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
           {errorMsg}
        </div>
      )}

      {/* STEP 1: Basics */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Horizontal Cover Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cover Image (Horizontal) *</label>
              <div className="flex items-center gap-4">
                {formData.cover_image_url ? (
                  <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200">
                    <img src={formData.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleChange('cover_image_url', '')}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-indigo-500 hover:bg-indigo-50/50">
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      {isUploading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      ) : (
                        <>
                          <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Upload Cover</p>
                          <p className="text-[10px] text-gray-400">Desktop (2:1) - 1200x600</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image_url')} disabled={isUploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Vertical Poster Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Vertical Poster (4:5) *</label>
              <div className="flex items-center gap-4">
                {formData.vertical_poster_url ? (
                  <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200">
                    <img src={formData.vertical_poster_url} alt="Poster" className="h-full w-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleChange('vertical_poster_url', '')}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-indigo-500 hover:bg-indigo-50/50">
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      {isUploading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      ) : (
                        <>
                          <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Upload Poster</p>
                          <p className="text-[10px] text-gray-400">Mobile (4:5) - 1080x1350</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'vertical_poster_url')} disabled={isUploading} />
                  </label>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
               <select
                 value={formData.category_id}
                 onChange={(e) => handleChange('category_id', e.target.value)}
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
               >
                 <option value="">Select Category</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Format *</label>
               <select
                 value={formData.event_type}
                 onChange={(e) => handleChange('event_type', e.target.value as CreateEventInput['event_type'])}
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
               >
                 <option value="in_person">In Person</option>
                 <option value="online">Online</option>
                 <option value="hybrid">Hybrid</option>
               </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Short Summary</label>
            <textarea
              value={formData.short_description || ''}
              onChange={(e) => handleChange('short_description', e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Full Details</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
            />
          </div>
        </div>
      )}

      {/* STEP 2: Schedule */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
               <label className="block text-sm font-medium text-gray-700">Event Starts *</label>
              <input
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => handleChange('start_datetime', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Event Ends *</label>
              <input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => handleChange('end_datetime', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Location */}
      {currentStep === 2 && (
        <div className="space-y-6">
             <div className="space-y-6 rounded-lg border p-4 bg-gray-50/50 border-gray-200">
                <h3 className="font-semibold text-gray-900">Venue / Platform Info</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name / Link</label>
                  <input
                    type="text"
                    value={formData.location?.venue_name || ''}
                    onChange={(e) => handleLocationChange('venue_name', e.target.value)}
                    className="mt-1 w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white"
                  />
               </div>
               {formData.event_type !== 'online' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm mb-1">City</label>
                        <input value={formData.location?.city || ''} onChange={(e) => handleLocationChange('city', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                 </div>
               )}
            </div>
        </div>
      )}

      {/* STEP 4: Tickets */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticketing Method *</label>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
               {[
                 { id: 'platform', label: 'Sell via Platform' },
                 { id: 'external', label: 'External Link' },
                 { id: 'free', label: 'Free Event' },
                 { id: 'rsvp', label: 'RSVP Only' }
               ].map(opt => (
                 <label key={opt.id} className={`flex cursor-pointer items-center justify-center rounded-lg border p-4 text-sm font-semibold transition-all hover:bg-gray-50 ${formData.ticketing_mode === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700'}`}>
                   <input type="radio" name="ticketing" className="hidden" checked={formData.ticketing_mode === opt.id} onChange={() => handleChange('ticketing_mode', opt.id as CreateEventInput['ticketing_mode'])} />
                   {opt.label}
                 </label>
               ))}
             </div>
          </div>

          {formData.ticketing_mode === 'external' && (
             <div>
               <label className="block text-sm font-medium mb-1">External Ticket URL *</label>
               <input type="url" placeholder="https://eventbrite.com/..." className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" value={formData.external_ticket_url || ''} onChange={e => handleChange('external_ticket_url', e.target.value)} />
             </div>
          )}

          {formData.ticketing_mode === 'platform' && (
             <div className="space-y-4">
               <h3 className="font-semibold">Ticket Tiers</h3>
                {formData.ticket_tiers?.map((tier, idx: number) => (
                   <div key={idx} className="relative rounded-lg border border-gray-200 p-4 bg-gray-50 group">
                      <button onClick={() => removeTicketTier(idx)} className="absolute right-3 top-3 text-red-500 hover:text-red-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition">Remove</button>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Tier Name</label>
                             <input value={tier.name} onChange={e => handleTierChange(idx, 'name', e.target.value)} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" placeholder="e.g. Early Bird" />
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Category</label>
                            <select 
                              value={tier.tier_category} 
                              onChange={e => handleTierChange(idx, 'tier_category', e.target.value as NonNullable<CreateEventInput['ticket_tiers']>[number]['tier_category'])}
                              className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white"
                            >
                               <option value="general">General</option>
                               <option value="boys">Boys</option>
                               <option value="girls">Girls</option>
                               <option value="stag">Stag</option>
                               <option value="couple">Couple</option>
                               <option value="vip">VIP</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Price (₹)</label>
                            <input type="number" value={tier.price} onChange={e => handleTierChange(idx, 'price', Number(e.target.value))} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" />
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Total Qty</label>
                            <input type="number" value={tier.total_quantity} onChange={e => handleTierChange(idx, 'total_quantity', Number(e.target.value))} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" />
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Max/Booking</label>
                             <input type="number" value={tier.max_per_booking} onChange={e => handleTierChange(idx, 'max_per_booking', Number(e.target.value))} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" />
                         </div>
                      </div>
                  </div>
                ))}
               <button onClick={addTicketTier} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  + Add Ticket Tier
               </button>
             </div>
          )}
        </div>
      )}

      {/* Button Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50 hover:bg-gray-50"
        >
          Back
        </button>
        
        <div className="flex gap-3">
          {currentStep === steps.length - 1 ? (
             <button
               onClick={() => submitForm('published')}
               disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
             >
               {isSubmitting ? 'Updating...' : 'Update Event'}
             </button>
          ) : (
            <button
               onClick={handleNext}
                className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
               Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

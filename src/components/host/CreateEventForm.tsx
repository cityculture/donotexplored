'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schemas'
import { createEventAction, uploadEventImageAction } from '@/actions/event.actions'
import { mapPostgresError } from '@/lib/utils/error-mapper'
interface Category {
  id: string
  name: string
  slug: string
}

interface CreateEventFormProps {
  categories: Category[]
  pageId: string
}

const steps = ['Basics', 'Schedule', 'Location', 'Details', 'Tickets']

export function CreateEventForm({ categories, pageId }: CreateEventFormProps) {
  const router = useRouter()
  
  // High-level Wizard State
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image_url' | 'vertical_poster_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setErrorMsg(null)
    
    // For a brand new event, we use a temporary placeholder or a unique ID if we had one.
    // We'll just use 'new-event' as the folder for now.
    const res = await uploadEventImageAction('new-event', file)
    if (res.error) {
      setErrorMsg(res.error)
    } else if (res.url) {
      handleChange(field, res.url)
    }
    setIsUploading(false)
  }

  // Local drafted state backing Zod Schema requirements
  const [formData, setFormData] = useState<Partial<CreateEventInput>>({
    title: '',
    category_id: '',
    event_type: 'in_person',
    ticketing_mode: 'platform',
    start_datetime: '',
    end_datetime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_recurring: false,
    short_description: '',
    description: '',
    cover_image_url: '',
    vertical_poster_url: '',
    is_age_restricted: false,
    min_age: null,
    refund_policy: 'no_refund',
    refund_policy_text: '',
    status: 'published',
    ticket_tiers: [],
    agenda: [],
    faqs: [],
    tags: []
  })

  // Date/Time Split State
  const [schedule, setSchedule] = useState({
    startDate: formData.start_datetime ? formData.start_datetime.split('T')[0] : '',
    startTime: formData.start_datetime ? formData.start_datetime.split('T')[1]?.substring(0, 5) : '18:00',
    endDate: formData.end_datetime ? formData.end_datetime.split('T')[0] : '',
    endTime: formData.end_datetime ? formData.end_datetime.split('T')[1]?.substring(0, 5) : '21:00'
  })

  // Handlers
  const handleNext = () => {
    // Basic step validation could occur here by partially pinging `createEventSchema.pick({...})`
    // For scaffolding quickly we allow moving steps and validate comprehensively on Draft/Publish.
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
         ...(prev.location || { venue_name: '', address_line_1: '', city: '', state: '', country: '', postal_code: '' }),
         [field]: value
      }
    }))
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

  const handleArrayChange = <F extends 'agenda' | 'faqs' | 'tags'>(
    field: F, 
    action: 'add' | 'remove' | 'update', 
    index?: number, 
    data?: any // data can be string (for tags) or object (for agenda/faqs)
  ) => {
    setFormData(prev => {
      const currentList = prev[field] as any[] || []
      const list = [...currentList]
      
      if (action === 'add') {
        list.push(data)
      } else if (action === 'remove' && index !== undefined) {
        list.splice(index, 1)
      } else if (action === 'update' && index !== undefined) {
        list[index] = typeof data === 'object' ? { ...list[index], ...data } : data
      }
      
      return { ...prev, [field]: list }
    })
  }

  const submitForm = async (status: 'draft' | 'published') => {
    setErrorMsg(null)
    setIsSubmitting(true)
    
    try {
       // Reconstruct ISO strings from separate date/time picks
       let startISO = ''
       let endISO = ''

       if (schedule.startDate && schedule.startTime) {
         startISO = `${schedule.startDate}T${schedule.startTime}:00`
       }
       if (schedule.endDate && schedule.endTime) {
         endISO = `${schedule.endDate}T${schedule.endTime}:00`
       }

       const finalPayload = { 
         ...formData, 
         status, 
         start_datetime: startISO, 
         end_datetime: endISO, 
         host_page_id: pageId 
       }
       const parsed = createEventSchema.parse(finalPayload)
       
       const builtFormData = new FormData()
       builtFormData.append('data', JSON.stringify(parsed))

       const res = await createEventAction(builtFormData)
       if (res?.error) {
         // Use error mapper for server-side errors
         setErrorMsg(mapPostgresError(res))
         return
       }
       
       // Success -> send to success hub
       router.push(`/members/host-dashboard/${pageId}/events?success=${res?.slug || ''}`)

    } catch (err: unknown) {
       console.error(err)
       // Check if it's a Zod error or something else
       if (err instanceof Error && err.name === 'ZodError') {
         setErrorMsg('Please check all required fields across all steps before submitting.')
       } else {
         setErrorMsg(mapPostgresError(err))
       }
    } finally {
       setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
      
      {/* Progress Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Create New Event</h1>
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, idx) => (
            <button 
              key={step} 
              onClick={() => setCurrentStep(idx)}
              className="flex flex-1 flex-col items-center group transition"
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
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              maxLength={255}
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
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
               placeholder="Briefly describe what your event is about (up to 500 chars)"
             />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700">Full Details</label>
             <textarea
               value={formData.description || ''}
               onChange={(e) => handleChange('description', e.target.value)}
               rows={6}
               className="mt-1 block w-full font-mono rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
               placeholder="Add complete details, agenda, and requirements here..."
             />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-4 border-t border-gray-100">
             <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={formData.is_age_restricted}
                     onChange={e => handleChange('is_age_restricted', e.target.checked)}
                     className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                   />
                   <span className="text-sm font-medium text-gray-700">Age Restricted Event?</span>
                </label>
                {formData.is_age_restricted && (
                   <div className="animate-in fade-in duration-300">
                      <label className="block text-xs text-gray-500 mb-1">Minimum Age Required</label>
                      <input 
                        type="number" 
                        value={formData.min_age || ''} 
                        onChange={e => handleChange('min_age', e.target.value ? Number(e.target.value) : null)}
                        placeholder="e.g. 18"
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                   </div>
                )}
             </div>

             <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Refund Policy</label>
                <select
                  value={formData.refund_policy}
                  onChange={e => handleChange('refund_policy', e.target.value as CreateEventInput['refund_policy'])}
                  className="w-full rounded border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="no_refund">No Refunds</option>
                  <option value="flexible">Flexible (24h before)</option>
                  <option value="moderate">Moderate (7d before)</option>
                  <option value="strict">Strict (30d before)</option>
                  <option value="custom">Custom Policy</option>
                </select>
                {formData.refund_policy === 'custom' && (
                   <textarea
                     value={formData.refund_policy_text || ''}
                     onChange={e => handleChange('refund_policy_text', e.target.value)}
                     rows={3}
                     placeholder="Specify your custom refund terms..."
                     className="mt-2 w-full rounded border-gray-300 px-3 py-2 text-sm bg-white"
                   />
                )}
             </div>
          </div>
        </div>
      )}

      {/* STEP 2: Schedule */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Start Schedule</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={schedule.startDate}
                      onChange={(e) => setSchedule(prev => ({ ...prev, startDate: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Start Time</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">End Schedule</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">End Date</label>
                    <input
                      type="date"
                      value={schedule.endDate}
                      onChange={(e) => setSchedule(prev => ({ ...prev, endDate: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">End Time</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Doors Open</label>
              <input
                type="time" // We mock input matching backend expectations conceptually
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm bg-white"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Timezone *</label>
              <input
                type="text"
                readOnly
                value={formData.timezone}
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Location */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
           {['in_person', 'hybrid'].includes(formData.event_type!) && (
               <div className="space-y-6 rounded-lg border p-4 bg-gray-50/50 border-gray-200">
                  <h3 className="font-semibold text-gray-900">Physical Venue</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                   <input
                     type="text"
                     placeholder="e.g. Central Library"
                     value={formData.location?.venue_name || ''}
                     onChange={(e) => handleLocationChange('venue_name', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white"
                   />
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                   <input
                     type="text"
                     value={formData.location?.address_line_1 || ''}
                     onChange={(e) => handleLocationChange('address_line_1', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">City</label>
                        <input value={formData.location?.city || ''} onChange={(e) => handleLocationChange('city', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">State</label>
                        <input value={formData.location?.state || ''} onChange={(e) => handleLocationChange('state', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Country</label>
                        <input value={formData.location?.country || ''} onChange={(e) => handleLocationChange('country', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Postal Code</label>
                        <input value={formData.location?.postal_code || ''} onChange={(e) => handleLocationChange('postal_code', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                 </div>
              </div>
           )}

            {['online', 'hybrid'].includes(formData.event_type!) && (
               <div className="space-y-6 rounded-lg border p-4 bg-gray-50/50 border-gray-200">
                  <h3 className="font-semibold text-gray-900">Virtual Stream</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform</label>
                   <select
                     value={formData.online_platform || ''}
                     onChange={(e) => handleChange('online_platform', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2"
                   >
                     <option value="">Select Platform</option>
                     <option value="Zoom">Zoom</option>
                     <option value="Google Meet">Google Meet</option>
                     <option value="Microsoft Teams">Microsoft Teams</option>
                     <option value="Custom Link">Custom Link</option>
                   </select>
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event URL</label>
                   <input
                     type="url"
                     placeholder="https://..."
                     value={formData.online_event_url || ''}
                     onChange={(e) => handleChange('online_event_url', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2"
                   />
                 </div>
              </div>
           )}
        </div>
      )}

      {/* STEP 4: Details (Agenda, FAQs, Tags) */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          {/* Agenda */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Event Agenda</h3>
            <div className="space-y-4">
              {formData.agenda?.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 bg-zinc-50 p-4 relative group">
                  <button onClick={() => handleArrayChange('agenda', 'remove', idx)} className="absolute right-3 top-3 text-red-500 opacity-0 group-hover:opacity-100 text-xs font-bold">Remove</button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input 
                      placeholder="Session Title" 
                      value={item.title} 
                      onChange={e => handleArrayChange('agenda', 'update', idx, { title: e.target.value })}
                      className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={item.start_time} 
                        onChange={e => handleArrayChange('agenda', 'update', idx, { start_time: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                      <input 
                        type="time" 
                        value={item.end_time || ''} 
                        onChange={e => handleArrayChange('agenda', 'update', idx, { end_time: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <textarea 
                      placeholder="Session Description (Optional)" 
                      value={item.description || ''} 
                      onChange={e => handleArrayChange('agenda', 'update', idx, { description: e.target.value })}
                      className="w-full rounded border-gray-300 px-3 py-2 text-sm sm:col-span-2"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => handleArrayChange('agenda', 'add', undefined, { title: '', start_time: '12:00', description: '' })}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                + Add Agenda Item
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* FAQs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Common FAQs</h3>
            <div className="space-y-4">
              {formData.faqs?.map((faq, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 bg-zinc-50 p-4 relative group">
                   <button onClick={() => handleArrayChange('faqs', 'remove', idx)} className="absolute right-3 top-3 text-red-500 opacity-0 group-hover:opacity-100 text-xs font-bold">Remove</button>
                   <div className="space-y-3">
                      <input 
                        placeholder="Question" 
                        value={faq.question} 
                        onChange={e => handleArrayChange('faqs', 'update', idx, { question: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                      <textarea 
                        placeholder="Answer" 
                        value={faq.answer} 
                        onChange={e => handleArrayChange('faqs', 'update', idx, { answer: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                        rows={2}
                      />
                   </div>
                </div>
              ))}
              <button 
                onClick={() => handleArrayChange('faqs', 'add', undefined, { question: '', answer: '' })}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                + Add FAQ
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  {tag}
                  <button onClick={() => handleArrayChange('tags', 'remove', idx)} className="hover:text-red-500">×</button>
                </span>
              ))}
              <input 
                placeholder="Add tag and press Enter" 
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val && !formData.tags?.includes(val)) {
                      handleArrayChange('tags', 'add', undefined, val)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
                className="rounded-full border border-gray-300 px-4 py-1 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Tickets */}
      {currentStep === 4 && (
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

          {(formData.ticketing_mode === 'free' || formData.ticketing_mode === 'rsvp') && (
             <div>
               <label className="block text-sm font-medium mb-1">Maximum Capacity (Optional)</label>
               <input type="number" placeholder="Leave blank for unlimited" className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" value={formData.max_capacity || ''} onChange={e => handleChange('max_capacity', Number(e.target.value))} />
             </div>
          )}

          {formData.ticketing_mode === 'platform' && (
             <div className="space-y-4">
               <h3 className="font-semibold">Ticket Tiers</h3>
                {formData.ticket_tiers?.map((tier, idx) => (
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
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Back
        </button>
        
        <div className="flex gap-3">
          {currentStep === steps.length - 1 ? (
             <>
               <button
                 onClick={() => submitForm('draft')}
                 disabled={isSubmitting}
                  className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
               >
                 Save Draft
               </button>
               <button
                 onClick={() => submitForm('published')}
                 disabled={isSubmitting}
                  className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
               >
                 {isSubmitting ? 'Publishing...' : 'Publish Event'}
               </button>
             </>
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

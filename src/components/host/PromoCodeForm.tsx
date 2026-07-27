'use client'

import { useState } from 'react'

import { createPromoCodeAction } from '@/actions/promo.actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PromoCodeFormProps {
  events: { id: string; title: string }[]
  onSuccess?: () => void
}

export default function PromoCodeForm({ events, onSuccess }: PromoCodeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const code = formData.get('code') as string
    const description = formData.get('description') as string
    const discount_type = formData.get('discount_type') as 'percentage' | 'fixed_amount'
    const discount_value = Number(formData.get('discount_value'))
    const event_id = formData.get('event_id') as string | null
    const max_uses_str = formData.get('max_uses') as string
    const uses_per_user_str = formData.get('uses_per_user') as string
    const valid_from = formData.get('valid_from') as string | null
    const valid_until = formData.get('valid_until') as string | null

    const input = {
      code,
      description,
      discount_type,
      discount_value,
      event_id: event_id === 'all' ? null : event_id,
      max_uses: max_uses_str ? Number(max_uses_str) : null,
      uses_per_user: uses_per_user_str ? Number(uses_per_user_str) : 1,
      valid_from: valid_from || null,
      valid_until: valid_until || null
    }

    const res = await createPromoCodeAction(input)

    setIsSubmitting(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Promo code created successfully!')
      router.refresh()
      if (onSuccess) onSuccess()
    }
  }

  const generateCode = () => {
    const str = Math.random().toString(36).substring(2, 8).toUpperCase()
    const el = document.getElementById('code') as HTMLInputElement
    if (el) {
      el.value = 'PROMO' + str
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Promo Code</label>
          <input 
            type="text" 
            id="code" 
            name="code" 
            required 
            placeholder="e.g. SUMMER25"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <button 
          type="button" 
          onClick={generateCode}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
        >
          Generate
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
          <select 
            id="discount_type" 
            name="discount_type"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed_amount">Fixed Amount (₹)</option>
          </select>
        </div>
        <div>
          <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Value</label>
          <input 
            type="number" 
            id="discount_value" 
            name="discount_value" 
            required 
            min="0"
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applicable Event</label>
        <select 
          id="event_id" 
          name="event_id"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">All My Events</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses (Total)</label>
          <input 
            type="number" 
            id="max_uses" 
            name="max_uses" 
            min="1"
            placeholder="Leave empty for unlimited"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="uses_per_user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uses Per User</label>
          <input 
            type="number" 
            id="uses_per_user" 
            name="uses_per_user" 
            defaultValue="1"
            min="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid From</label>
          <input 
            type="datetime-local" 
            id="valid_from" 
            name="valid_from" 
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
          <input 
            type="datetime-local" 
            id="valid_until" 
            name="valid_until" 
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Internal)</label>
        <textarea 
          id="description" 
          name="description" 
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-indigo-700"
        >
          {isSubmitting ? 'Creating...' : 'Create Promo Code'}
        </button>
      </div>
    </form>
  )
}

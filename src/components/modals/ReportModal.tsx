'use client'

import { useState } from 'react'
import { reportContentAction } from '@/actions/report.actions'
import { toast } from 'sonner'
import { ShieldAlert, X } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  reportedType: 'event' | 'user' | 'review' | 'discussion' | 'message'
  reportedId: string
}

export function ReportModal({ isOpen, onClose, reportedType, reportedId }: Props) {
  const [reason, setReason] = useState('inappropriate')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await reportContentAction(reportedType, reportedId, reason, details)
      toast.success('Report submitted successfully. Our team will review it shortly.')
      onClose()
      setDetails('')
      setReason('inappropriate')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to submit report: ' + message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-500">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="font-semibold">Report Content</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="spam">Spam or unwanted commercial content</option>
              <option value="fake_event">Fake event or scam</option>
              <option value="harassment">Harassment or bullying</option>
              <option value="inappropriate">Inappropriate or offensive content</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="Please provide any additional context that might help us investigate..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { createReview, toggleReviewHelpful } from '@/actions/review.actions'
import { Star, ThumbsUp, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ReviewItem {
  id: string
  rating: number
  rating_host: number | null
  rating_venue: number | null
  rating_value: number | null
  title: string | null
  review_text: string | null
  created_at: string
  helpful_count: number
  user: {
    full_name: string | null
    username: string
    avatar_url: string | null
  }
  is_verified_attendee: boolean
}

interface EventReviewsProps {
  eventId: string
  initialReviews: ReviewItem[]
  hasBooking?: string | null // booking_id if user has booked
}

export function EventReviews({ eventId, initialReviews, hasBooking }: EventReviewsProps) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [hostRating, setHostRating] = useState(5)
  const [venueRating, setVenueRating] = useState(5)
  const [valueRating, setValueRating] = useState(5)
  const [isPending, startTransition] = useTransition()
  const [hoverRating, setHoverRating] = useState<Record<string, number>>({})

  const avgRating = initialReviews.length > 0
    ? initialReviews.reduce((acc, r) => acc + r.rating, 0) / initialReviews.length
    : 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('eventId', eventId)
    formData.append('rating', rating.toString())
    formData.append('hostRating', hostRating.toString())
    formData.append('venueRating', venueRating.toString())
    formData.append('valueRating', valueRating.toString())
    if (hasBooking) formData.append('bookingId', hasBooking)

    startTransition(async () => {
      const result = await createReview(formData)
      if (result.success) {
        setShowForm(false)
        window.location.reload()
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const handleHelpful = async (reviewId: string) => {
    startTransition(async () => {
      const result = await toggleReviewHelpful(reviewId, eventId)
      if (result.error) alert(result.error)
    })
  }

  const StarGroup = ({ label, value, onChange, category }: { label: string, value: number, onChange: (v: number) => void, category: string }) => (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-bold text-gray-700 dark:text-gray-700">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHoverRating(prev => ({ ...prev, [category]: s }))}
            onMouseLeave={() => setHoverRating(prev => ({ ...prev, [category]: 0 }))}
            className="transition-transform hover:scale-110"
          >
            <Star className={`h-5 w-5 ${(hoverRating[category] || value) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-700'}`} />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <section id="reviews" className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900">Reviews & Ratings</h2>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setRating(s)
                    setShowForm(true)
                  }}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                </button>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-600">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 dark:text-gray-600">({initialReviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border-2 border-indigo-100 bg-indigo-50/30 p-6 dark:border-indigo-100/30 dark:bg-indigo-100/10">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StarGroup label="Overall Experience" value={rating} onChange={setRating} category="overall" />
              <StarGroup label="Host Performance" value={hostRating} onChange={setHostRating} category="host" />
              <StarGroup label="Venue Quality" value={venueRating} onChange={setVenueRating} category="venue" />
              <StarGroup label="Value for Money" value={valueRating} onChange={setValueRating} category="value" />
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-bold text-gray-700 dark:text-gray-700">Review Title</label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Summarize your experience"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-100"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reviewText" className="text-sm font-bold text-gray-700 dark:text-gray-700">Your Review</label>
              <textarea
                name="reviewText"
                id="reviewText"
                rows={4}
                placeholder="What did you like or dislike?"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Review
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="grid gap-6 md:grid-cols-2">
        {initialReviews.length > 0 ? (
          initialReviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-50 dark:bg-zinc-800">
                    {review.user.avatar_url ? (
                      <img src={review.user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-indigo-400">
                        {(review.user.full_name || review.user.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{review.user.full_name || review.user.username}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                      <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                      {review.is_verified_attendee && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Verified Attendee
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-zinc-800'}`} />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                {review.title && <h4 className="font-bold text-gray-900 dark:text-gray-100">{review.title}</h4>}
                {review.review_text && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{review.review_text}</p>}
                
                {/* Detailed Ratings Breakdown */}
                <div className="mt-3 flex flex-wrap gap-4 border-t border-gray-50 pt-3 dark:border-zinc-800">
                  {review.rating_host && (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Host</span>
                       <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-2.5 w-2.5 ${s <= review.rating_host! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                       </div>
                    </div>
                  )}
                  {review.rating_venue && (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Venue</span>
                       <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-2.5 w-2.5 ${s <= review.rating_venue! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                       </div>
                    </div>
                  )}
                  {review.rating_value && (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Value</span>
                       <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-2.5 w-2.5 ${s <= review.rating_value! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-zinc-800">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Helpful ({review.helpful_count})
                </button>
                <button className="text-xs text-gray-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400">
                  Report
                </button>
              </div>
            </div>
          ))
        ) : (
          null
        )}
      </div>

      {/* Refund Policy (Requirement 8) */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-widest mb-3">Refund Policy</h3>
        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
          Tickets are non-refundable unless the event is cancelled or rescheduled by the host. 
          In case of cancellation, a full refund including platform fees will be processed within 5-7 business days. 
          Please review the specific terms on your booking confirmation for more details.
        </p>
      </div>
    </section>
  )
}

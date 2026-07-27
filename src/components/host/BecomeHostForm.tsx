'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { createHostPageSchema, CreateHostProfileInput } from '@/lib/validations/host.schemas'
import { createHostPageAction } from '@/actions/host.actions'

import { createSubscriptionAction } from '@/actions/subscription.actions'

interface BecomeHostFormProps {
  plan?: string
  paid?: string
  paymentId?: string
  pageId?: string
  isModal?: boolean
  onFinish?: (data: CreateHostProfileInput) => void
}

export function BecomeHostForm({ plan, paid, paymentId, pageId, isModal, onFinish }: BecomeHostFormProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isModal) return // Don't handle post-payment logic in modal-mode (modal parent handles it)
    async function handlePostPayment() {
      // Flow 1: Updating existing page subscription
      if (pageId && paid === 'true' && plan) {
        console.log('🚀 Activating existing page subscription:', { pageId, plan, paymentId })
        setIsLoading(true)
        const subResult = await createSubscriptionAction(
          pageId,
          plan as 'monthly' | 'yearly',
          paymentId || 'MOCK_PAYMENT_ID',
          true
        )
        if (subResult.success) {
          router.push(`/members/host-dashboard/${pageId}`)
        } else {
          setErrorMsg(subResult.error || 'Failed to record subscription')
          setIsLoading(false)
        }
        return
      }

      // Flow 2: Creating NEW page after successful payment
      if (!pageId && paid === 'true' && plan) {
        const pendingDataStr = sessionStorage.getItem('pending_host_page')
        if (pendingDataStr) {
          console.log('🚀 Finalizing host page creation from session data')
          setIsLoading(true)
          try {
            const pendingData = JSON.parse(pendingDataStr)
            
            // Re-construct FormData for createHostPageAction
            const formData = new FormData()
            Object.keys(pendingData).forEach(key => {
              if (pendingData[key]) formData.append(key, pendingData[key])
            })

            const result = await createHostPageAction(formData)

            if (result?.error) {
              setErrorMsg(result.error)
              setIsLoading(false)
              return
            }

            if (result.pageId) {
              // Record subscription
              const subResult = await createSubscriptionAction(
                result.pageId,
                plan as 'monthly' | 'yearly',
                paymentId || 'MOCK_PAYMENT_ID',
                true
              )

              if (subResult.success) {
                sessionStorage.removeItem('pending_host_page')
                window.location.href = `/members/host-dashboard/${result.pageId}`
              } else {
                setErrorMsg('Page created but subscription recording failed. Please contact support.')
                setIsLoading(false)
              }
            }
          } catch (err) {
            console.error('Error finalizing host page:', err)
            setErrorMsg('Failed to process host page data after payment.')
            setIsLoading(false)
          }
        }
      }
    }
    handlePostPayment()
  }, [pageId, paid, plan, paymentId, router])

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<CreateHostProfileInput>({
    resolver: zodResolver(createHostPageSchema),
    mode: 'onChange',
    defaultValues: {
      host_type: 'individual'
    }
  })

  // Watch host_type for conditional rendering if needed
  const hostType = watch('host_type')

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateHostProfileInput)[] = []
    
    if (step === 1) fieldsToValidate = ['host_type', 'display_name']
    if (step === 2) fieldsToValidate = ['description', 'tagline', 'website_url', 'instagram_handle']
    
    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  async function onSubmit(data: CreateHostProfileInput) {
    if (isModal && onFinish) {
      const locationData = {
        city: (document.getElementById('city') as HTMLInputElement)?.value,
        state: (document.getElementById('state') as HTMLInputElement)?.value,
        country: (document.getElementById('country') as HTMLSelectElement)?.value,
      }
      onFinish({ ...data, ...locationData } as CreateHostProfileInput)
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    // In the NEW flow, we don't create the page yet.
    // Instead, we redirect to the plan selection page with the form data in state/session
    // OR we redirect with query params (less ideal for large data but simple)
    // For now, let's stick to the prompt's request: "user will fill host page creation form and at the end user will click the payment button"
    
    // We'll save the form data to sessionStorage and redirect to payment selection
    try {
      const locationData = {
        city: (document.getElementById('city') as HTMLSelectElement)?.value,
        state: (document.getElementById('state') as HTMLSelectElement)?.value,
        country: (document.getElementById('country') as HTMLSelectElement)?.value,
      }
      
      const combinedData = { ...data, ...locationData }
      sessionStorage.setItem('pending_host_page', JSON.stringify(combinedData))
      
      router.push('/members/host-dashboard/create')
    } catch (err) {
      console.error('Failed to save pending host page:', err)
      setErrorMsg('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (pageId && paid === 'true') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent font-black"></div>
        <p className="mt-4 text-zinc-900 font-black text-xl tracking-tight">Activating your host page...</p>
        <p className="text-zinc-500 mt-2">Please wait while we set everything up</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8">
         <div className="flex items-center justify-between">
           <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
             <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current bg-white dark:bg-zinc-900 font-bold">1</span>
             <span className="text-xs font-medium mt-1">Basics</span>
           </div>
           <div className={`h-1 w-full flex-1 mx-2 rounded ${step >= 2 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-zinc-700'}`}></div>
           <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
             <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current bg-white dark:bg-zinc-900 font-bold">2</span>
             <span className="text-xs font-medium mt-1">Details</span>
           </div>
           <div className={`h-1 w-full flex-1 mx-2 rounded ${step >= 3 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-zinc-700'}`}></div>
           <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
             <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current bg-white dark:bg-zinc-900 font-bold">3</span>
             <span className="text-xs font-medium mt-1">Location</span>
           </div>
         </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {errorMsg && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* STEP 1 */}
        <div className={step === 1 ? 'block space-y-4' : 'hidden'}>
          <div className="space-y-1">
            <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
              Host Type
            </label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" value="individual" {...register('host_type')} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                <span className="text-sm dark:text-gray-300">Individual</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="organisation" {...register('host_type')} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                <span className="text-sm dark:text-gray-300">Organisation</span>
              </label>
            </div>
            {errors.host_type && <p className="text-sm text-red-500">{errors.host_type.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="display_name" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
              {hostType === 'organisation' ? 'Organisation Name' : 'Display Name'}
            </label>
            <input
              {...register('display_name')}
              id="display_name"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder={hostType === 'organisation' ? 'Event Co.' : 'John Doe'}
            />
            {errors.display_name && <p className="text-sm text-red-500">{errors.display_name.message}</p>}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </div>
        </div>

        {/* STEP 2 */}
        <div className={step === 2 ? 'block space-y-4' : 'hidden'}>
           <div className="space-y-1">
            <label htmlFor="tagline" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
              Short Tagline (Optional)
            </label>
            <input
              {...register('tagline')}
              id="tagline"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder="Creating unforgettable moments"
            />
            {errors.tagline && <p className="text-sm text-red-500">{errors.tagline.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
              Description / Bio
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder="Tell attendees more about what you do..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="website_url" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                Website URL
              </label>
              <input
                {...register('website_url')}
                id="website_url"
                type="url"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                placeholder="https://example.com"
              />
              {errors.website_url && <p className="text-sm text-red-500">{errors.website_url.message}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="instagram_handle" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                Instagram Handle
              </label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700">@</span>
                <input
                  {...register('instagram_handle')}
                  id="instagram_handle"
                  className="flex h-10 w-full min-w-0 flex-1 rounded-none rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </div>
        </div>

        {/* STEP 3 */}
        <div className={step === 3 ? 'block space-y-4' : 'hidden'}>
          <div className="space-y-1">
             <label htmlFor="country" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">Country</label>
             <select id="country" name="country" required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                <option value="">Select country...</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="IN">India</option>
                <option value="CA">Canada</option>
             </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
             <div className="space-y-1">
                <label htmlFor="state" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">State / Region</label>
                <input id="state" name="state" required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="State" />
             </div>
             <div className="space-y-1">
                <label htmlFor="city" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">City</label>
                <input id="city" name="city" required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="City" />
             </div>
          </div>

          <div className="pt-4 flex items-start gap-3">
             <input required id="agreement" type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
             <label htmlFor="agreement" className="text-sm text-gray-600 dark:text-gray-400">
               I agree to the City Culture Host Terms of Service. I confirm that all submitted details are accurate and acknowledge that KYC verification may be required before payouts are processed.
             </label>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}

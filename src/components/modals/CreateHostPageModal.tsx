'use client'

import { useState } from 'react'
import { X, Sparkles, Zap, Shield, Check } from 'lucide-react'
import { BecomeHostForm } from '../host/BecomeHostForm'
import { createSubscriptionOrderAction, createSubscriptionAction } from '@/actions/subscription.actions'
import { createHostPageAction } from '@/actions/host.actions'
import { toast } from 'sonner'
import Script from 'next/script'
import { CreateHostProfileInput } from '@/lib/validations/host.schemas'

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
  razorpay_subscription_id?: string
}

interface CreateHostPageModalProps {
  isOpen: boolean
  onClose: () => void
}

const plans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: '49',
    duration: 'month',
    icon: <Zap className="h-5 w-5 text-indigo-600" />,
    color: 'bg-indigo-50'
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: '499',
    duration: 'year',
    icon: <Sparkles className="h-5 w-5 text-amber-600" />,
    color: 'bg-amber-50',
    popular: true
  }
]

export function CreateHostPageModal({ isOpen, onClose }: CreateHostPageModalProps) {
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [formData, setFormData] = useState<CreateHostProfileInput | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFormFinish = (data: CreateHostProfileInput) => {
    setFormData(data)
    setStep('payment')
  }

  const handlePayment = async (planId: 'monthly' | 'yearly') => {
    setIsProcessing(planId)
    try {
      // 1. Create Subscription Order first
      const res = await createSubscriptionOrderAction(planId)
      
      if (res.error || !res.subscriptionId) {
        toast.error(res.error || 'Failed to initiate payment')
        setIsProcessing(null)
        return
      }

      const options = {
        key: res.keyId,
        name: 'City Culture',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Subscription`,
        subscription_id: res.subscriptionId,
        handler: async function (response: RazorpayResponse) {
             toast.success('Payment successful! Finalizing your host page...')
             
             // 2. Create the Host Page
             const fd = new FormData()
             if (formData) {
               Object.keys(formData).forEach(key => {
                 const value = formData[key as keyof CreateHostProfileInput]
                 if (value) fd.append(key, value.toString())
               })
             }
             
             const result = await createHostPageAction(fd)
             if (result.error) {
               toast.error('Page creation failed: ' + result.error)
               setIsProcessing(null)
               return
             }

             // 3. Record Subscription
             if (result.pageId) {
               const subResult = await createSubscriptionAction(
                 result.pageId,
                 planId,
                 response.razorpay_subscription_id || response.razorpay_payment_id || 'MOCK_PAYMENT_ID',
                 true
               )

               if (subResult.success) {
                 toast.success('Host Page Created Successfully!')
                 window.location.href = `/members/host-dashboard/${result.pageId}`
               } else {
                 toast.error('Subscription recording failed. Please contact support.')
                 setIsProcessing(null)
               }
             }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(null)
          }
        }
      }

      const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options)
      rzp.open()

    } catch (err: unknown) {
      toast.error('Payment error: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setIsProcessing(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className={`bg-white dark:bg-zinc-950 rounded-[2.5rem] w-full ${step === 'form' ? 'max-w-3xl' : 'max-w-2xl'} overflow-hidden shadow-2xl border border-white/20 relative animate-in zoom-in-95 duration-200`}>
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-2xl transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-12">
          {step === 'form' ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tight">Create Host Page</h2>
                <p className="text-zinc-500 mt-2 font-medium">Join our community of world-class event organizers.</p>
              </div>
              <BecomeHostForm isModal onFinish={handleFormFinish} />
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 mb-6 font-black">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-4xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tight mb-4">Choose Your Plan</h2>
              <p className="text-zinc-500 mb-10 font-medium">Unlock unlimited event creation and premium features.</p>
              
              <div className="grid sm:grid-cols-2 gap-6 text-left">
                {plans.map(plan => (
                  <div 
                    key={plan.id}
                    className={`relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer group ${isProcessing === plan.id ? 'border-indigo-600 scale-[1.02]' : 'border-zinc-100 dark:border-zinc-800 hover:border-indigo-200'}`}
                    onClick={() => handlePayment(plan.id as any)}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-2xl ${plan.color} dark:bg-zinc-900 group-hover:rotate-12 transition-transform`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black">₹{plan.price}</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">/{plan.duration}</span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                      <li className="flex items-center gap-2 line-clamp-1"><Check className="w-3 h-3 text-emerald-500" /> Unlimited Events</li>
                      <li className="flex items-center gap-2 line-clamp-1"><Check className="w-3 h-3 text-emerald-500" /> Custom Branding</li>
                      <li className="flex items-center gap-2 line-clamp-1"><Check className="w-3 h-3 text-emerald-500" /> Verified Badge</li>
                    </ul>

                    <button 
                      disabled={!!isProcessing}
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isProcessing === plan.id ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:scale-[1.02] shadow-xl shadow-zinc-200 dark:shadow-none'}`}
                    >
                      {isProcessing === plan.id ? 'Processing...' : 'Secure Checkout'}
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setStep('form')}
                className="mt-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                disabled={!!isProcessing}
              >
                ← Back to profile details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

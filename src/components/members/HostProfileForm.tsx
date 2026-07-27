'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateHostPageAction } from '@/actions/host.actions'
import { Button, Input, Textarea } from '@/components/ui'
import { toast } from 'sonner'
import { 
  User, 
  MapPin, 
  Globe, 
  Instagram, 
  Banknote, 
  CreditCard,
  CheckCircle2,
  Info
} from 'lucide-react'
import { HostProfile } from '@/types'

type HostProfileWithBanking = HostProfile & {
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc_code?: string | null;
  upi_id?: string | null;
}

export default function HostProfileForm({ initialData }: { initialData: HostProfileWithBanking }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateHostPageAction(initialData.id, formData)
    
    setLoading(false)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated successfully')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Profile Details Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">Public Profile</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">How people see you on the platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Display Name</label>
            <Input 
              name="display_name" 
              defaultValue={initialData?.display_name || ''} 
              required 
              placeholder="e.g. City Culture Events"
              className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Tagline</label>
            <Input 
              name="tagline" 
              defaultValue={initialData?.tagline || ''} 
              placeholder="e.g. Bringing the city to life"
              className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Bio / Description</label>
          <Textarea 
            name="description" 
            defaultValue={initialData?.description || ''} 
            placeholder="Tell your story..."
            className="min-h-[160px] rounded-3xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-900 p-6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                name="city" 
                defaultValue={initialData?.city || ''} 
                className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-900"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Website</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                name="website_url" 
                defaultValue={initialData?.website_url || ''} 
                className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-900"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Instagram</label>
            <div className="relative">
              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                name="instagram_handle" 
                defaultValue={initialData?.instagram_handle || ''} 
                className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Payout & Banking Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">Payout Settings</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Where you want to receive your funds</p>
          </div>
        </div>

        <div className="bg-indigo-50/30 rounded-[2.5rem] p-8 border border-indigo-50/50 flex items-start gap-4 mb-8">
           <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
             <Info className="w-5 h-5 text-indigo-500" />
           </div>
           <div className="space-y-1">
             <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">Financial Verification Required</p>
             <p className="text-xs font-bold text-indigo-600/60 leading-relaxed uppercase tracking-widest">
               Please provide accurate information. Ticket sales revenue will be settled to these accounts. 
               Incorrect details may lead to delayed payouts.
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Bank Account Transfer</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Account Holder Name</label>
                <Input 
                  name="bank_account_name" 
                  defaultValue={initialData?.bank_account_name || ''} 
                  placeholder="As per bank records"
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Account Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    name="bank_account_number" 
                    defaultValue={initialData?.bank_account_number || ''} 
                    className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold text-gray-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">IFSC Code</label>
                <Input 
                  name="bank_ifsc_code" 
                  defaultValue={initialData?.bank_ifsc_code || ''} 
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Instant Payout (UPI)</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">UPI ID (VPA)</label>
              <Input 
                name="upi_id" 
                defaultValue={initialData?.upi_id || ''} 
                placeholder="yourname@upi"
                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold text-gray-900"
              />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 ml-1">Recommended for faster settlements</p>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100 flex items-center justify-end gap-6">
        <Button 
          type="submit" 
          disabled={loading}
          className="h-16 px-12 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black italic shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'SAVING CHANGES...' : 'SAVE PROFILE & BANKING'}
        </Button>
      </div>
    </form>
  )
}

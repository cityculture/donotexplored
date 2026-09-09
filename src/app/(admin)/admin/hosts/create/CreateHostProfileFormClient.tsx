'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

interface UserItem {
  id: string
  username: string
  email: string
}

interface CreateHostProfileFormClientProps {
  activeUsers: UserItem[]
  action: (prevState: any, formData: FormData) => Promise<{ error?: string } | undefined>
}

export default function CreateHostProfileFormClient({ activeUsers, action }: CreateHostProfileFormClientProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await action(null, formData)
      if (res?.error) {
        setErrorMsg(res.error)
        toast.error(res.error)
      } else {
        toast.success('Host profile created successfully!')
        router.refresh()
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred.')
      toast.error('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold uppercase text-[10px] tracking-widest">
          {errorMsg}
        </div>
      )}

      {/* Select User */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
          Select Owner User <span className="text-red-500">*</span>
        </label>
        <select
          name="user_id"
          required
          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none shadow-inner"
        >
          <option value="">-- Choose User --</option>
          {activeUsers.map((user) => (
            <option key={user.id} value={user.id}>
              @{user.username} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {/* Display Name & Host Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            name="display_name"
            type="text"
            required
            placeholder="e.g. Salty Media"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Host Type <span className="text-red-500">*</span>
          </label>
          <select
            name="host_type"
            required
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none shadow-inner"
          >
            <option value="organisation">Organisation</option>
            <option value="individual">Individual</option>
          </select>
        </div>
      </div>

      {/* Organisation Name & Tagline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Organisation Name
          </label>
          <input
            name="organisation_name"
            type="text"
            placeholder="e.g. Salty Media Group"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Tagline
          </label>
          <input
            name="tagline"
            type="text"
            placeholder="e.g. Crafting premium social meetups"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
          Description
        </label>
        <textarea
          name="description"
          placeholder="Tell the community about this organiser..."
          rows={4}
          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
        />
      </div>

      {/* Location Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            City
          </label>
          <input
            name="city"
            type="text"
            placeholder="e.g. Pune"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            State
          </label>
          <input
            name="state"
            type="text"
            placeholder="e.g. Maharashtra"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Country
          </label>
          <input
            name="country"
            type="text"
            placeholder="e.g. India"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Website URL
          </label>
          <input
            name="website_url"
            type="url"
            placeholder="https://example.com"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Instagram Handle
          </label>
          <input
            name="instagram_handle"
            type="text"
            placeholder="e.g. saltymedia"
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold italic text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-50">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-gray-950 text-white px-8 py-6 rounded-2xl font-black italic tracking-tight transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'PUBLISHING...' : 'PUBLISH HOST PROFILE'}
        </button>
      </div>
    </form>
  )
}

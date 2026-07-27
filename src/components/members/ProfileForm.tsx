'use client'

import { useState, useRef } from 'react'
import { User } from '@/types'
import { updateProfileAction } from '@/actions/user.actions'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function ProfileForm({ initialData }: { initialData: User }) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMsg(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${initialData.id}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      setSuccessMsg('Avatar uploaded. Remember to save changes.')
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      setErrorMsg(error.message || 'Error uploading avatar')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData(e.currentTarget)
    formData.set('avatar_url', avatarUrl)
    
    const result = await updateProfileAction(formData)

    if (result?.error) {
      setErrorMsg(result.error)
    } else if (result?.success) {
      setSuccessMsg('Profile updated successfully.')
    }
    
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-600">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center sm:flex-row sm:gap-8">
        <div className="relative group">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-indigo-100 bg-gray-50">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="mt-4 text-center sm:mt-0 sm:text-left">
          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500">Click the camera icon to update your avatar.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-semibold text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            id="full_name"
            defaultValue={initialData.full_name || ''}
            disabled={isLoading}
            placeholder="John Doe"
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Username */}
        <div className="space-y-2 opacity-80">
          <label htmlFor="username" className="text-sm font-semibold text-gray-700">
            Username
          </label>
          <div className="flex rounded-md shadow-sm border border-gray-200 overflow-hidden bg-gray-50">
            <span className="inline-flex items-center px-3 text-gray-500 sm:text-sm border-r border-gray-200">
              @
            </span>
            <input
              type="text"
              name="username"
              id="username"
              value={initialData.username}
              readOnly
              className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">* Managed automatically</p>
        </div>

        {/* Email - Read Only */}
        <div className="space-y-2 opacity-80">
          <label className="text-sm font-semibold text-gray-700">Email Address</label>
          <input
            type="email"
            value={initialData.email}
            disabled
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            defaultValue={initialData.phone || ''}
            disabled={isLoading}
            placeholder="+91 98765 43210"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label htmlFor="date_of_birth" className="text-sm font-semibold text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            id="date_of_birth"
            defaultValue={initialData.date_of_birth || ''}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-semibold text-gray-700">
            Gender
          </label>
          <select
            name="gender"
            id="gender"
            defaultValue={initialData.gender || ''}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        {/* Preferred Language */}
        <div className="space-y-2">
          <label htmlFor="preferred_language" className="text-sm font-semibold text-gray-700">
            Preferred Language
          </label>
          <select
            name="preferred_language"
            id="preferred_language"
            defaultValue={initialData.preferred_language || 'en'}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Role Selection - NEW */}
        <div className="space-y-2 col-span-full">
          <label className="text-sm font-semibold text-gray-700">
            Account Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${initialData.role === 'member' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <input 
                  type="radio" 
                  name="role" 
                  value="member" 
                  defaultChecked={initialData.role === 'member'} 
                  className="w-4 h-4 text-indigo-600" 
                />
                <span className="font-bold text-gray-900">Member</span>
              </div>
              <p className="text-xs text-gray-500">I want to discover and book events.</p>
            </label>
            <label className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${initialData.role === 'host' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <input 
                  type="radio" 
                  name="role" 
                  value="host" 
                  defaultChecked={initialData.role === 'host'} 
                  className="w-4 h-4 text-indigo-600" 
                />
                <span className="font-bold text-gray-900">Host</span>
              </div>
              <p className="text-xs text-gray-500">I want to organize and host events.</p>
            </label>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
          Bio
        </label>
        <textarea
          name="bio"
          id="bio"
          rows={4}
          defaultValue={initialData.bio || ''}
          disabled={isLoading}
          placeholder="Tell us a bit about yourself..."
          className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="preferred_currency" className="text-sm font-semibold text-gray-700">
            Preferred Currency
          </label>
          <select
            name="preferred_currency"
            id="preferred_currency"
            defaultValue={initialData.preferred_currency || 'INR'}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AUD">AUD ($)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="timezone" className="text-sm font-semibold text-gray-700">
            Timezone
          </label>
          <select
            name="timezone"
            id="timezone"
            defaultValue={initialData.timezone || 'Asia/Kolkata'}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Asia/Kolkata">India Standard Time (Kolkata)</option>
            <option value="UTC">UTC (Universal Coordinated Time)</option>
            <option value="America/New_York">Eastern Time (US/New York)</option>
            <option value="Europe/London">Greenwich Mean Time (London)</option>
            <option value="Asia/Dubai">Gulf Standard Time (Dubai)</option>
            <option value="Asia/Singapore">Singapore Standard Time</option>
          </select>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-10 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

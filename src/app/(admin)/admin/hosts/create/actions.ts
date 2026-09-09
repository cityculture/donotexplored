'use server'

import { fetchFromBackend } from '@/lib/backendClient'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createHostProfileAdminAction(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await (supabase
    .from('users') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    return { error: 'Forbidden: Admin access required' }
  }

  const user_id = formData.get('user_id') as string
  const display_name = formData.get('display_name') as string
  const host_type = formData.get('host_type') as string
  const organisation_name = formData.get('organisation_name') as string || undefined
  const tagline = formData.get('tagline') as string || undefined
  const description = formData.get('description') as string || undefined
  const city = formData.get('city') as string || undefined
  const state = formData.get('state') as string || undefined
  const country = formData.get('country') as string || undefined
  const website_url = formData.get('website_url') as string || undefined
  const instagram_handle = formData.get('instagram_handle') as string || undefined

  if (!user_id || !display_name || !host_type) {
    return { error: 'Please fill in all required fields.' }
  }

  try {
    const res = await fetchFromBackend('/api/admin/hosts', {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        display_name,
        host_type,
        organisation_name,
        tagline,
        description,
        city,
        state,
        country,
        website_url,
        instagram_handle
      })
    })

    if (res.error) {
      return { error: res.error }
    }
  } catch (error: any) {
    console.error('Error creating host profile via backend:', error)
    return { error: error.message || 'Failed to create host profile.' }
  }

  revalidatePath('/admin/hosts')
  redirect('/admin/hosts')
}

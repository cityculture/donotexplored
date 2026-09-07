'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyFirebaseToken } from '../lib/firebase/verify-token'
import { supabaseAdmin } from '../lib/supabase/admin'
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../lib/validations/auth.schemas'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type AppSupabaseClient = SupabaseClient<Database>
const ADMIN_EMAIL = 'trishuldn@gmail.com'

export async function setAdminSessionAction(idToken: string) {
  if (!idToken) {
    return { error: 'Missing authentication token' }
  }

  try {
    const verified = await verifyFirebaseToken(idToken)
    const email = verified.email?.toLowerCase().trim()

    if (email !== ADMIN_EMAIL) {
      return {
        error: `Access Denied: Only ${ADMIN_EMAIL} is authorized to access the admin portal.`
      }
    }

    // Verify role in database
    const { data: userProfile, error: dbError } = await (supabaseAdmin as any)
      .from('users')
      .select('id, role')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle()

    if (dbError || userProfile?.role !== 'admin') {
      return {
        error: 'Database verification failed: User does not have administrator privileges in database.'
      }
    }

    // Set secure HTTP-only admin session cookie
    const cookieStore = await cookies()
    cookieStore.set('cc_admin_session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('setAdminSessionAction error:', err)
    return { error: err?.message || 'Authentication session verification failed' }
  }
}

export async function logoutAdminAction() {
  const cookieStore = await cookies()
  cookieStore.delete('cc_admin_session')
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function logoutAction() {
  return logoutAdminAction()
}

export async function registerAction(_formData: FormData): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Public registration is disabled on the administrator portal.' }
}

export async function forgotPasswordAction(_formData: FormData): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}

export async function updatePasswordAction(_formData: FormData): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Password updates for administrator must be managed via Firebase Auth.' }
}

export async function checkUsernameAction(username: string) {
  const { data } = await (supabaseAdmin as AppSupabaseClient)
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return { available: !data }
}

import { LoginForm } from '@/components/auth/LoginForm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyFirebaseToken } from '@/lib/firebase/verify-token'
import { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Portal Sign In | City Culture',
  description: 'Sign in to City Culture Administrator Control Panel',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLoginPage() {
  // If admin is already authenticated with valid token, redirect to dashboard
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('cc_admin_session')?.value

  if (sessionToken) {
    try {
      const verified = await verifyFirebaseToken(sessionToken)
      if (verified.email?.toLowerCase().trim() === 'trishuldn@gmail.com') {
        redirect('/')
      }
    } catch {
      // Invalid/expired token, let user re-login
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-50/30">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Internal Management
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            CITY CULTURE
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Administrator Control Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xl shadow-gray-200/50 backdrop-blur-sm">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} City Culture. All rights reserved.
        </p>
      </div>
    </div>
  )
}

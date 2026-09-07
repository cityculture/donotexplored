import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyFirebaseToken } from '@/lib/firebase/verify-token'
import AdminNav from '@/components/admin/AdminNav'
import { Metadata } from 'next'

const ALLOWED_ADMIN_EMAIL = 'trishuldn@gmail.com'

export const metadata: Metadata = {
  title: 'Admin Dashboard | City Culture',
  description: 'Manage the City Culture platform.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('cc_admin_session')?.value

  if (!sessionToken) {
    redirect('/login')
  }

  // Verify Firebase Token cryptographically
  let verified
  try {
    verified = await verifyFirebaseToken(sessionToken)
  } catch (tokenErr) {
    console.error('Invalid admin session token in AdminLayout:', tokenErr)
    redirect('/login')
  }

  const email = verified?.email?.toLowerCase().trim()
  if (email !== ALLOWED_ADMIN_EMAIL) {
    console.warn(`Unauthorized access attempt by ${email} to admin portal`)
    redirect('/login')
  }

  // Verify database record & role
  const supabase = await createClient()
  const { data: profile, error } = await (supabase
    .from('users') as any)
    .select('id, username, full_name, role')
    .eq('email', ALLOWED_ADMIN_EMAIL)
    .maybeSingle()

  if (error || profile?.role !== 'admin') {
    console.error('Admin profile verification failed in database:', error, profile)
    redirect('/login')
  }

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Animated Ambient Mesh Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-indigo-600/20 blur-[130px] animate-float-1" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[140px] animate-float-2" />
        <div className="absolute -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full bg-blue-600/15 blur-[150px] animate-glow" />
      </div>

      {/* Modern Icon-based Navigation (Desktop Dock + Mobile Bottom Dock) */}
      <AdminNav userName={profile?.full_name || profile?.username || 'Trishul'} />

      {/* Main Content Area */}
      <main className="relative z-10 min-h-screen md:pl-[96px] md:pr-8 md:py-6 px-4 pt-4 pb-24 max-w-7xl mx-auto transition-all">
        {children}
      </main>
    </div>
  )
}

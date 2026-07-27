import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import { Metadata } from 'next'

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check role
  const { data: profile, error } = await (supabase
    .from('users') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminNav userName={profile?.username || 'Admin'} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

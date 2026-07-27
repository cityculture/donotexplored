import { createClient } from '@/lib/supabase/server'
import CategoryManager from '@/components/admin/CategoryManager'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await (supabase
    .from('categories') as any)
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <CategoryManager categories={categories || []} />
    </div>
  )
}

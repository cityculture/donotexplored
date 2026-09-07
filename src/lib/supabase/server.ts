import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/database.types'

let serviceClientInstance: SupabaseClient<Database> | null = null

export async function createClient(): Promise<SupabaseClient<Database>> {
  if (serviceClientInstance) {
    return serviceClientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  serviceClientInstance = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return serviceClientInstance
}

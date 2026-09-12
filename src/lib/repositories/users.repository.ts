import { createClient } from '../supabase/server'
import { UserUpdate, User, Subscription } from '@/types'

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data
}

export async function updateUser(id: string, userData: UserUpdate): Promise<User> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select('*')
    .single()
  return data as unknown as User
}

export async function getUserWithHostProfile(
  id: string
): Promise<User & { subscriptions: Subscription[] }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*, subscriptions:subscriptions(*)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...data,
    subscriptions: data.subscriptions || []
  } as unknown as User & { subscriptions: Subscription[] }
}

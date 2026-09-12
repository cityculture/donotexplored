import { createClient } from '../supabase/server'
import { HostWithDetails, EventWithDetails } from '@/types/api.types'
import { User } from '@/types'

export async function getHostProfileByUsername(username: string): Promise<HostWithDetails | null> {
  const supabase = await createClient()

  // Get the user by username (case-insensitive)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .ilike('username', username)
    .single()

  if (userError || !userData) {
    console.error(`User not found for username "${username}":`, userError)
    return null
  }

  // Get follower count
  const { count: followerCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', userData.id)

  // Get event count
  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', userData.id)
    .eq('status', 'published')

  // Check if current user follows
  const { data: sessionData } = await supabase.auth.getSession()
  let isFollowing = false
  if (sessionData?.session?.user) {
    const { data: followData } = await supabase
      .from('user_follows')
      .select('follower_id, followed_id')
      .eq('follower_id', sessionData.session.user.id)
      .eq('followed_id', userData.id)
      .maybeSingle()
    
    isFollowing = !!followData
  }

  return {
    ...userData,
    follower_count: followerCount || 0,
    event_count: eventCount || 0,
    is_following: isFollowing
  } as unknown as HostWithDetails
}

export async function getHostEvents(hostId: string): Promise<EventWithDetails[]> {
  const supabase = await createClient()

  const { data: userData } = await supabase.from('users').select('username').eq('id', hostId).single()
  const username = userData?.username

  if (!username) return []

  const { data, error } = await supabase
    .from('v_events_public')
    .select('*')
    .eq('host_username', username)
    .eq('status', 'published')
    .order('start_datetime', { ascending: true })

  if (error) return []
  return data as unknown as EventWithDetails[]
}

export async function getAllHosts(): Promise<HostWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_approved', true)
    .order('follower_count', { ascending: false })

  if (error) return []
  
  return data as unknown as HostWithDetails[]
}

'use client'

import React from 'react'
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations'

/**
 * Global provider to initialize real-time listeners across the app.
 * E.g., for conversations updating in the background.
 */
export function RealtimeProvider({ 
  userId, 
  children 
}: { 
  userId?: string
  children: React.ReactNode 
}) {
  // Setup global conversation listeners
  // A localized hook in ConversationList handles its own state, but if we want 
  // global caching we could put it here. For now it just initializes the channel
  // if needed, or we just let it be fully managed by `useRealtimeConversations` internally.
  // We'll leave it as a shell that can be expanded if global state (Zustand) is used.
  
  // Just returning children as the hooks componentize the subscription nicely.
  return <>{children}</>
}

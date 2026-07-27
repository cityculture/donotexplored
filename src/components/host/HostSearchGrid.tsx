'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Users, Star, Search } from 'lucide-react'

interface Host {
  id: string
  display_name: string
  logo_url: string | null
  tagline: string | null
  description: string | null
  is_approved: boolean
  follower_count: number
  rating_avg: number
  user: {
    username: string
    avatar_url: string | null
  }
}

interface HostSearchGridProps {
  initialHosts: Host[]
}

export function HostSearchGrid({ initialHosts }: HostSearchGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'popular'>('all')

  const filteredHosts = useMemo(() => {
    return initialHosts.filter(host => {
      const matchesSearch = 
        host.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.tagline?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter = 
        filterType === 'all' || 
        (filterType === 'verified' && host.is_approved) ||
        (filterType === 'popular' && (host.follower_count || 0) > 10)

      return matchesSearch && matchesFilter
    }).sort((a, b) => {
      if (filterType === 'popular') return (b.follower_count || 0) - (a.follower_count || 0)
      return 0
    })
  }, [initialHosts, searchQuery, filterType])

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search hosts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {(['all', 'verified', 'popular'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterType === type 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredHosts.map((host) => (
          <Link 
            key={host.id} 
            href={`/hosts/${host.user?.username}`}
            className="group relative flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 transition-all hover:shadow-lg hover:border-indigo-100"
          >
            <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              <Image 
                src={host.logo_url || host.user?.avatar_url || '/placeholder-avatar.jpg'} 
                alt={host.display_name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-black text-gray-900 truncate uppercase italic">
                  {host.display_name}
                </h3>
                {host.is_approved && (
                  <ShieldCheck className="h-3 w-3 text-indigo-500 shrink-0" fill="currentColor" fillOpacity={0.2} />
                )}
              </div>
              
              <p className="text-[9px] font-bold text-gray-400 mb-1 tracking-wider uppercase">
                @{host.user?.username}
              </p>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5 text-indigo-500" />
                  <span className="text-[10px] font-black text-gray-700">{host.follower_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-black text-gray-700">{host.rating_avg || '5.0'}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredHosts.length === 0 && (
        <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest italic">No hosts found</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    
    // Read city from localStorage to match CitySelector
    const city = localStorage.getItem('user_city')
    if (city && city !== 'All Cities') params.set('city', city)
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleSearch}
        className="relative flex items-center bg-white rounded-lg shadow-2xl overflow-hidden p-1 sm:p-2"
      >
        <div className="flex-1 flex items-center px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Events, Categories, Location..."
            className="w-full px-3 py-3 text-zinc-950 font-medium border-none focus:ring-0 placeholder-gray-400 text-sm sm:text-base outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors hidden sm:flex items-center justify-center"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}

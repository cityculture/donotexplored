'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, MapPin, Tag, X, TrendingUp } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { VEventsPublic } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { results, loading, updateFilters } = useSearch({ q: query })

  // Set isMounted on mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch popular searches on focus
  useEffect(() => {
    if (isFocused && popularSearches.length === 0) {
      fetch('/api/events/search/popular')
        .then(res => res.json())
        .then(data => setPopularSearches(data.popular || []))
        .catch(() => {})
    }
  }, [isFocused, popularSearches.length])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsFocused(false)
    }
  }

  const handleSelectPopular = (term: string) => {
    setQuery(term)
    router.push(`/search?q=${encodeURIComponent(term)}`)
    setIsFocused(false)
  }

  const previewResults = results.slice(0, 5)

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for events, workshops, or cities..."
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isFocused && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Popular Searches - Show when no query */}
          {!query && popularSearches.length > 0 && (
            <div className="p-4">
              <h3 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectPopular(term)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Preview Results - Show when query exists */}
          {query && (
            <div className="max-h-[400px] overflow-y-auto">
              <div className="p-2">
                {loading ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : previewResults.length > 0 ? (
                  <>
                    <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Events
                    </h3>
                    {previewResults.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        onClick={() => setIsFocused(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors group"
                      >
                        <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {event.cover_image_url ? (
                            <Image
                              src={event.cover_image_url}
                              alt={event.title || 'Event'}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                              <Tag className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{event.city}</span>
                            <span>•</span>
                            <span>{isMounted && event.start_datetime ? new Date(event.start_datetime).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="p-2 border-t border-gray-50 mt-2">
                      <button
                        onClick={handleSearch}
                        className="w-full py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        View all results
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

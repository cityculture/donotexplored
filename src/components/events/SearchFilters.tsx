'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { FilterIcon, XIcon, SearchIcon, MapPinIcon } from 'lucide-react'
import { useDebounce } from 'use-debounce'

interface Category {
  slug: string
  name: string
}

interface SearchFiltersProps {
  categories: Category[]
  cities: string[]
  initialKeyword?: string
}

export function SearchFilters({ categories, cities, initialKeyword = '' }: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Mobile filter toggle
  const [isOpen, setIsOpen] = useState(false)

  // Local state for debouncing
  const [keyword, setKeyword] = useState(initialKeyword)
  const [debouncedKeyword] = useDebounce(keyword, 500)

  // Sync keyword to URL when debounced value changes
  useEffect(() => {
    if (debouncedKeyword !== initialKeyword) {
      updateFilter('q', debouncedKeyword)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword])

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value.trim() !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      
      // Reset page to 1 when filters change
      params.delete('page')

      startTransition(() => {
        router.push(`/search?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams]
  )

  const clearAll = () => {
    setKeyword('')
    startTransition(() => {
      router.push('/search', { scroll: false })
    })
  }

  // Active sync from URL for other selects
  const currentCity = searchParams.get('city') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentEventType = searchParams.get('event_type') || ''
  
  // To handle active filter chips
  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'q').length

  return (
    <>
      {/* Mobile Trigger */}
      <div className="mb-4 flex items-center justify-between sm:hidden">
         <div className="relative flex-1 mr-4">
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input
               type="text"
               placeholder="Search events..."
               value={keyword}
               onChange={(e) => setKeyword(e.target.value)}
               className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
             />
         </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-[38px] items-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200"
        >
          <FilterIcon className="h-4 w-4" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      </div>

      {/* Main Filter Bar */}
      <div className={`
        mb-8 space-y-4 sm:block
        ${isOpen ? 'block' : 'hidden'}
      `}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          
          {/* Keyword Search (Desktop hidden on mobile top bar) */}
          <div className="relative hidden sm:block w-full lg:col-span-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          {/* City Dropdown */}
          <div className="relative w-full lg:col-span-1">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={currentCity}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Any City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full lg:col-span-1">
            <select
              value={currentCategory}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Event Type */}
          <div className="relative w-full lg:col-span-1">
            <select
              value={currentEventType}
              onChange={(e) => updateFilter('event_type', e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Any Format</option>
              <option value="in_person">In Person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          
          {/* Action / Clear */}
          <div className="flex items-center lg:col-span-1 justify-end">
             <button
               onClick={clearAll}
               className="text-sm text-gray-500 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
             >
               Clear filters
             </button>
          </div>

        </div>

        {/* Loading Indicator for Transitions */}
        {isPending && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-indigo-50 dark:bg-indigo-900/20">
            <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] bg-indigo-500"></div>
          </div>
        )}
      </div>
    </>
  )
}

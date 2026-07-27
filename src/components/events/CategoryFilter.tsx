'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Category {
  slug: string
  name: string
  icon_url: string | null
  color_hex: string | null
}

interface CategoryFilterProps {
  categories: Category[]
  selectedSlug?: string
}

export function CategoryFilter({ categories, selectedSlug }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (slug: string) => {
    // We construct new params manually to preserve other potential filters like ?city=
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="-mx-4 flex overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 scrollbar-hide">
      <div className="flex gap-3">
        <button
          onClick={() => handleSelect('all')}
          className={`
            flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all
            ${!selectedSlug 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-white text-zinc-500 hover:bg-gray-50 border border-gray-100'
            }
          `}
        >
          All
        </button>

        {categories.map((cat) => {
          const isSelected = selectedSlug === cat.slug
          
          return (
             <button
                key={cat.slug}
                onClick={() => handleSelect(cat.slug)}
                className={`
                   flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all
                    ${isSelected 
                      ? 'bg-indigo-600 text-white border-transparent shadow-md' 
                      : 'bg-white text-stone-500 hover:bg-gray-50 border border-gray-200'
                    }
                `}
             >
                {cat.icon_url && (
                   <img src={cat.icon_url} alt="" className="h-3.5 w-3.5 object-contain" />
                )}
                {cat.name}
             </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { Category } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

const ANIMATED_ICONS: Record<string, string> = {
  'tickets': '/animated-icons/tickets.gif',
  'parties': '/animated-icons/champagne-bucket.gif',
  'theatre': '/animated-icons/masks.gif',
  'sports': '/animated-icons/bowling-ball.gif',
  'art': '/animated-icons/art.gif',
  'family': '/animated-icons/family.gif',
  'health': '/animated-icons/health.gif',
  'meetups': '/animated-icons/meetups.gif',
  'online': '/animated-icons/online.gif',
  'tech': '/animated-icons/tech.gif',
  'travel': '/animated-icons/travel.gif',
  'workshop': '/animated-icons/workshop.gif',
}

function getIconForCategory(slug: string) {
  const s = slug.toLowerCase()
  if (s.includes('ticket')) return ANIMATED_ICONS['tickets']
  if (s.includes('party') || s.includes('drink') || s.includes('nightlife') || s.includes('champagne') || s.includes('pantry')) return ANIMATED_ICONS['parties']
  if (s.includes('theatre') || s.includes('drama') || s.includes('comedy') || s.includes('mask')) return ANIMATED_ICONS['theatre']
  if (s.includes('sport') || s.includes('fitness') || s.includes('bowling') || s.includes('trek')) return ANIMATED_ICONS['sports']
  if (s.includes('art') || s.includes('culture') || s.includes('exhibition') || s.includes('history')) return ANIMATED_ICONS['art']
  if (s.includes('family') || s.includes('kid')) return ANIMATED_ICONS['family']
  if (s.includes('health') || s.includes('yoga') || s.includes('wellness') || s.includes('spa')) return ANIMATED_ICONS['health']
  if (s.includes('meet') || s.includes('social') || s.includes('community') || s.includes('mixer')) return ANIMATED_ICONS['meetups']
  if (s.includes('online') || s.includes('virtual')) return ANIMATED_ICONS['online']
  if (s.includes('tech') || s.includes('coding') || s.includes('software')) return ANIMATED_ICONS['tech']
  if (s.includes('travel') || s.includes('tour') || s.includes('trip') || s.includes('walk')) return ANIMATED_ICONS['travel']
  if (s.includes('workshop') || s.includes('class') || s.includes('learn') || s.includes('literature')) return ANIMATED_ICONS['workshop']
  return ANIMATED_ICONS['tickets'] // Default icon
}

export function CategoryAnimatedIcons({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-white py-6 border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => {
            const icon = getIconForCategory(category.slug)

            return (
              <Link
                key={category.id}
                href={`/events?category=${category.slug}`}
                className="flex flex-col items-center group flex-shrink-0 min-w-[60px]"
              >
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-2 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={icon}
                    alt={category.name}
                    fill
                    className="object-contain"
                    unoptimized // Crucial for GIFs to animate
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] font-regular text-zinc-950 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-center leading-tight max-w-[80px]">
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

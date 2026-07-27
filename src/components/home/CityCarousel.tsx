'use client'

import Image from 'next/image'
import Link from 'next/link'

const CITIES = [
  { name: 'Mumbai', image: '/city-images-icons/mumbai.png' },
  { name: 'Delhi', image: '/city-images-icons/delhi.png' },
  { name: 'Bangalore', image: '/city-images-icons/bangalore.png' },
  { name: 'Hyderabad', image: '/city-images-icons/hyderabad.png' },
  { name: 'Pune', image: '/city-images-icons/pune.png' },
  { name: 'Chennai', image: '/city-images-icons/chennai.png' },
  { name: 'Kolkata', image: '/city-images-icons/kolkata.png' },
  { name: 'Ahmedabad', image: '/city-images-icons/ahmedabad.png' },
  { name: 'Jaipur', image: '/city-images-icons/jaipur.png' },
  { name: 'Kochi', image: '/city-images-icons/kochi.png' },
]

const CITY_COLORS = [
  'text-slate-900',
  'text-zinc-900',
  'text-neutral-900',
  'text-stone-900',
  'text-gray-900',
  'text-indigo-950',
  'text-blue-950',
  'text-cyan-950',
  'text-teal-950',
  'text-emerald-950',
]

export function CityCarousel() {
  return (
    <section className="py-24 bg-white overflow-hidden w-full">
      <div className="w-full">
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl font-black text-stone-950">Explore Cities</h2>
          <p className="text-gray-600 mt-2">Find events in major Indian cities</p>
        </div>

        <div className="relative py-10 w-full overflow-hidden">
          {/* Marquee Container */}
          <div className="flex animate-marquee gap-12 whitespace-nowrap">
            {[...CITIES, ...CITIES, ...CITIES, ...CITIES].map((city, idx) => {
              const colorClass = CITY_COLORS[idx % CITY_COLORS.length]
              // Unique background colors for icons (Item 12)
              const bgColors = [
                'bg-pink-100 border-pink-200',
                'bg-blue-100 border-blue-200',
                'bg-emerald-100 border-emerald-200',
                'bg-amber-100 border-amber-200',
                'bg-violet-100 border-violet-200',
                'bg-orange-100 border-orange-200',
                'bg-cyan-100 border-cyan-200',
                'bg-rose-100 border-rose-200',
                'bg-indigo-100 border-indigo-200',
                'bg-lime-100 border-lime-200'
              ]
              const bgColor = bgColors[idx % bgColors.length]

              return (
                <Link
                  key={`${city.name}-${idx}`}
                  href={`/events?city=${city.name}`}
                  className="flex-none group flex flex-col items-center"
                >
                  <div className={`relative w-36 h-36 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-4 ${bgColor} shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:rotate-2`}>
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110 p-4"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                  <p className={`mt-6 text-center font-black text-xl ${colorClass} group-hover:text-indigo-600 transition-colors uppercase tracking-widest`}>
                    {city.name}
                  </p>
                </Link>
              )
            })}
          </div>

          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-100% / 4)); }
            }
            .animate-marquee {
              animation: marquee 50s linear infinite;
              width: max-content;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}

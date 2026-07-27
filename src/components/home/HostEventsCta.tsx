'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export function HostEventsCta() {
  return (
    <section className="bg-indigo-900 py-16 px-4 sm:px-6 lg:px-8 rounded-3xl my-24 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          Do you host events?
        </h2>
        <p className="text-indigo-100 text-lg mb-8">
          Reach thousands of people looking for experiences like yours. 
          Start selling tickets in minutes with City Culture.
        </p>
        <Link 
          href="/members/host-dashboard/create" 
          className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-full font-black text-lg hover:bg-yellow-500 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus className="h-6 w-6" />
          Create event
        </Link>
      </div>
    </section>
  )
}

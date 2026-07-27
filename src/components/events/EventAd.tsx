'use client'

import React from 'react'

export function EventAd() {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Sponsored</p>
          <h4 className="font-bold text-indigo-950">Unlock Exclusive Experiences</h4>
          <p className="text-xs text-indigo-700/70 leading-relaxed">
            Upgrade your membership to access VIP events and priority booking.
          </p>
        </div>
        <button className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95">
          Learn More
        </button>
      </div>
    </div>
  )
}

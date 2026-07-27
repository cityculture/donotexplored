'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MembersNav } from './MembersNav'

export function MobileMembersSidebar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
      >
        <Menu className="h-4 w-4 text-indigo-600" />
        Dashboard Menu
      </button>

      {/* Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-[10002] flex w-full max-w-xs animate-in slide-in-from-left duration-300">
            <div className="relative flex w-full flex-col bg-white">
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-4" onClick={() => setIsOpen(false)}>
                <MembersNav user={user} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

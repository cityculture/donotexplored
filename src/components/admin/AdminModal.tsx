'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

export default function AdminModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'md'
}: AdminModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn(
        "relative w-full bg-zinc-950/95 text-white rounded-3xl shadow-2xl border border-white/15 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 backdrop-blur-2xl",
        maxWidthClasses[maxWidth]
      )}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-black italic uppercase tracking-tight text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-zinc-900 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Link as LinkIcon, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonsProps {
  url: string
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareData = {
    title: title,
    text: `Check out this event: ${title}`,
    url: url,
  }

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        copyToClipboard()
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-semibold text-sm"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-indigo-400 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="h-5 w-5" />
      </a>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-600 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-5 w-5" />
      </a>

      <button
        onClick={copyToClipboard}
        className="p-2 text-gray-500 hover:text-green-500 dark:text-zinc-400 dark:hover:text-green-400 transition-colors"
        aria-label="Copy Link"
      >
        {copied ? <Check className="h-5 w-5 text-green-500" /> : <LinkIcon className="h-5 w-5" />}
      </button>
    </div>
  )
}

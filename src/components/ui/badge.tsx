import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === 'default' && "border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-500",
        variant === 'secondary' && "border-white/10 bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
        variant === 'outline' && "text-zinc-300 border-white/10 bg-zinc-900/60",
        variant === 'success' && "border-emerald-500/30 bg-emerald-950/60 text-emerald-400",
        variant === 'warning' && "border-amber-500/30 bg-amber-950/60 text-amber-400",
        variant === 'danger' && "border-red-500/30 bg-red-950/60 text-red-400",
        className
      )}
      {...props}
    />
  )
}

export { Badge }

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variant === 'default' && "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500",
          variant === 'outline' && "border border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/10 hover:text-white",
          variant === 'ghost' && "text-zinc-400 hover:bg-white/10 hover:text-white",
          variant === 'danger' && "bg-red-950/60 border border-red-500/30 text-red-400 hover:bg-red-900/60 shadow",
          size === 'default' && "h-9 px-4 py-2",
          size === 'sm' && "h-7 rounded-xl px-2.5 text-[10px] uppercase font-black tracking-widest",
          size === 'lg' && "h-10 rounded-xl px-8",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

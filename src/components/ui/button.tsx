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
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variant === 'default' && "bg-indigo-600 text-white shadow hover:bg-indigo-700",
          variant === 'outline' && "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900",
          variant === 'ghost' && "hover:bg-gray-100 hover:text-gray-900",
          variant === 'danger' && "bg-red-600 text-white shadow hover:bg-red-700",
          size === 'default' && "h-9 px-4 py-2",
          size === 'sm' && "h-7 rounded-xl px-2.5 text-[10px] uppercase font-black tracking-widest",
          size === 'lg' && "h-10 rounded-md px-8",
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

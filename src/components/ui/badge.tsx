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
        variant === 'default' && "border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-700",
        variant === 'secondary' && "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        variant === 'outline' && "text-gray-900 border-gray-200",
        variant === 'success' && "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
        variant === 'warning' && "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
        variant === 'danger' && "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        className
      )}
      {...props}
    />
  )
}

export { Badge }

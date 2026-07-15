import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-textPrimary focus:ring-offset-2",
        {
          "border-transparent bg-textPrimary text-background": variant === "default",
          "border-transparent bg-gray-100 text-textPrimary": variant === "secondary",
          "text-textPrimary border-borderLight": variant === "outline",
          "border-transparent bg-green-50 text-accentGreen border-green-200": variant === "success",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

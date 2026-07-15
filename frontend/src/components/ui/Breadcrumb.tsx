import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-textSecondary font-medium tracking-wide", className)}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-textPrimary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-textPrimary" : ""}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

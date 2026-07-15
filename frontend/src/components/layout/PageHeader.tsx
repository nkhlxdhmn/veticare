import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "./Container"

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title,
  description,
  children,
  className, 
  ...props 
}: PageHeaderProps) {
  return (
    <header
      className={cn("pt-[80px] pb-12 animate-fade-in", className)}
      {...props}
    >
      <Container>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-textSecondary font-light leading-relaxed">
              {description}
            </p>
          )}
          {children && (
            <div className="pt-4">
              {children}
            </div>
          )}
        </div>
      </Container>
    </header>
  )
}

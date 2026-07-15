import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "./Container"

interface SectionProps extends React.HTMLAttributes<HTMLSelectElement> {
  as?: React.ElementType;
  containerClassName?: string;
  disableContainer?: boolean;
}

export function Section({ 
  className, 
  containerClassName,
  as: Component = "section", 
  disableContainer = false,
  children, 
  ...props 
}: SectionProps) {
  const content = disableContainer ? (
    children
  ) : (
    <Container className={containerClassName}>
      {children}
    </Container>
  );

  return (
    <Component
      className={cn("py-[120px]", className)}
      {...props}
    >
      {content}
    </Component>
  )
}

import { type ReactNode, useState, useEffect, useRef, createContext, useContext, type CSSProperties } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  as?: "div" | "span" | "section" | "article" | "header";
}

function FadeIn({ children, className, delay = 0, duration = DURATION.normal, y = 0, as: Tag = "div" }: FadeInProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  const style: CSSProperties = reduced
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      };

  return (
    <Tag className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}

interface StaggerProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  duration?: number;
  y?: number;
}

function Stagger({ children, className, staggerDelay = DURATION.stagger, duration = DURATION.normal, y = 8 }: StaggerProps) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <FadeIn key={i} delay={i * staggerDelay} duration={duration} y={y}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  y?: number;
}

function HoverCard({ children, className, scale = 1.01, y = -3 }: HoverScaleProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn("transition-[transform,box-shadow] duration-[220ms] ease-out will-change-transform", className)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `translateY(${y}px) scale(${scale})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {children}
    </div>
  );
}

function HoverButton({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn("transition-transform duration-[180ms] ease-out will-change-transform active:scale-[0.97]", className)}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </div>
  );
}

const StaggerContext = createContext(0);

function StaggerItem({ children, className, duration = DURATION.normal, y = 8 }: { children: ReactNode; className?: string; duration?: number; y?: number }) {
  const index = useContext(StaggerContext);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), index * DURATION.stagger);
    return () => clearTimeout(id);
  }, [index]);

  const style: CSSProperties = reduced
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      };

  return (
    <div className={cn(className)} style={style}>
      {children}
    </div>
  );
}

function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <StaggerContext.Provider key={i} value={i}>
              {child}
            </StaggerContext.Provider>
          ))
        : children}
    </div>
  );
}

function SuccessCheckmark({ className, size = 48 }: { className?: string; size?: number }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <CheckCircle2 className={cn("text-emerald-500", className)} size={size} />;
  }

  return (
    <div className={cn("relative animate-fade-scale-in", className)} style={{ width: size, height: size }}>
      <CheckCircle2 className="text-emerald-500" size={size} />
    </div>
  );
}

export { FadeIn, Stagger, HoverCard, HoverButton, StaggerItem, StaggerGroup, SuccessCheckmark };

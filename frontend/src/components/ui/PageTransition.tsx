import { type ReactNode } from "react";
import { useMountAnimation } from "@/hooks/use-mount-animation";

export function PageTransition({ children }: { children: ReactNode }) {
  const { style } = useMountAnimation();
  return <div style={style}>{children}</div>;
}

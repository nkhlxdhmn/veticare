import { useEffect, useState } from "react";
import { DURATION } from "@/lib/constants";

export function useMountAnimation(duration = DURATION.pageEnter) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return {
    mounted,
    style: {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(8px)",
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    } as React.CSSProperties,
  };
}

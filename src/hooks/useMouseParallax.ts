"use client";

import { useEffect, useRef } from "react";

export function useMouseParallax(
  intensity = 0.05
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * intensity * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * intensity * 100;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [intensity]);

  return ref;
}

"use client";

import { useEffect, useRef } from "react";

export function SpotlightMask() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = 50;
    let y = 50;

    const paint = () => {
      raf = 0;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };

    const handler = (e: MouseEvent) => {
      x = (e.clientX / innerWidth) * 100;
      y = (e.clientY / innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    window.addEventListener("mousemove", handler, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(480px circle at var(--mx,50%) var(--my,50%), rgba(0,102,255,0.12) 0%, rgba(0,229,255,0.04) 35%, transparent 60%)",
      }}
      aria-hidden="true"
    />
  );
}

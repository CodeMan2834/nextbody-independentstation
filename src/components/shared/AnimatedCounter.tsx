"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  suffix = "",
  label,
  decimals = 0,
}: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0);
  const started = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setCurrent(value);
      return;
    }

    const el = document.getElementById(`counter-${label.replace(/\s+/g, "-")}`);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(eased * value);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, label, reducedMotion]);

  const displayValue =
    decimals > 0 ? current.toFixed(decimals) : Math.round(current);

  return (
    <div
      id={`counter-${label.replace(/\s+/g, "-")}`}
      className="flex flex-col items-center gap-1"
    >
      <span className="text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.02em] tabular-nums">
        {displayValue}
        <span className="text-[var(--brand-accent)]">{suffix}</span>
      </span>
      <span className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  );
}

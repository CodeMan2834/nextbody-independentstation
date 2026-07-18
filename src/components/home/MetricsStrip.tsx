"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { METRICS } from "@/lib/constants";

export function MetricsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const items = ref.current?.querySelectorAll(".metric-item");
    if (!items) return;

    gsap.from(items, {
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.12,
      ease: "power2.out",
    });

    return () => {
      gsap.killTweensOf(items);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={ref}
      className="relative z-10 border-y border-[var(--surface-border)] bg-[var(--background)] py-16"
    >
      <div className="container-site grid grid-cols-2 gap-8 md:grid-cols-4">
        {METRICS.map((metric) => (
          <div key={metric.label} className="metric-item">
            <AnimatedCounter
              value={metric.value}
              suffix={metric.suffix}
              label={metric.label}
              decimals={metric.label === "DEXA Correlation" ? 2 : 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { METRICS, TECHNOLOGY_PIPELINE } from "@/lib/constants";

export function TechnologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const items = section.querySelectorAll(".tech-metric, .tech-step");
      gsap.from(items, {
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="relative z-10 border-t border-[var(--surface-border)] bg-[var(--background)] py-24 md:py-32"
      aria-label="Technology"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow="Technology"
          title="Innovation you can measure."
          subtitle="From structured-light capture to coach-ready delivery — spatial-grade body intelligence, engineered for daily gym operations."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="space-y-8">
            {TECHNOLOGY_PIPELINE.map((item) => (
              <div key={item.step} className="tech-step flex gap-5">
                <span className="mt-0.5 font-mono text-sm font-semibold text-[var(--brand-accent)]">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8 rounded-2xl border border-[var(--surface-border)] bg-[rgba(4,8,20,0.5)] p-8 md:p-10">
            {METRICS.map((metric) => (
              <div key={metric.label} className="tech-metric">
                <AnimatedCounter
                  value={metric.value}
                  suffix={metric.suffix}
                  label={metric.label}
                  decimals={metric.label === "DEXA Correlation" ? 2 : 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

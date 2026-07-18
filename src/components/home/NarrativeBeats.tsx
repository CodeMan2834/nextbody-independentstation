"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { NARRATIVE_BEATS } from "@/lib/constants";

export function NarrativeBeats() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const beats = sectionRef.current?.querySelectorAll(".narrative-beat");
    if (!beats?.length) return;

    const ctx = gsap.context(() => {
      beats.forEach((beat, i) => {
        gsap.fromTo(
          beat,
          { opacity: 0.2, y: 20 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: beat,
              start: "top 72%",
              end: "top 38%",
              scrub: 0.6,
            },
            ease: "none",
          }
        );

        if (i < beats.length - 1) {
          gsap.to(beat, {
            opacity: 0.25,
            y: -12,
            scrollTrigger: {
              trigger: beats[i + 1],
              start: "top 80%",
              end: "top 50%",
              scrub: 0.6,
            },
            ease: "none",
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="narrative"
      className="relative z-10 bg-[var(--background)]"
      aria-label="Value narrative"
    >
      <div className="container-site py-20 md:py-28">
        <div className="mx-auto flex max-w-[820px] flex-col gap-16 md:gap-24">
          {NARRATIVE_BEATS.map((line, i) => (
            <p
              key={line}
              className="narrative-beat text-balance text-center text-[clamp(22px,4vw,36px)] font-light leading-[1.25] tracking-[-0.02em] text-[var(--text-primary)]"
              style={reducedMotion ? { opacity: 1 } : undefined}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

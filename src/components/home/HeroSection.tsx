"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HeroContent } from "./HeroContent";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const galaxy = (
            window as Window & {
              __galaxyInstance?: { setScrollBlend: (v: number) => void };
            }
          ).__galaxyInstance;
          galaxy?.setScrollBlend(self.progress);
        },
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "center center",
          end: "bottom top",
          scrub: 1,
        },
      });

      tl.to("#heroTitle", { opacity: 0, y: -40, scale: 0.95 }).to(
        "#heroLead",
        { opacity: 0, y: -20 },
        0
      );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 42%, rgba(0,0,0,0.45) 100%)",
        }}
        aria-hidden="true"
      />

      <section
        id="introStage"
        ref={sectionRef}
        className="relative"
        style={{ height: reducedMotion ? "auto" : "200vh" }}
      >
        <div className="sticky top-[var(--header-height)] flex h-[calc(100vh-var(--header-height))] flex-col items-center justify-center px-6">
          <HeroContent />
          {!reducedMotion && (
            <p className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs tracking-[0.08em] text-[var(--text-muted)]">
              Scroll to explore ↓
            </p>
          )}
        </div>
      </section>
    </>
  );
}

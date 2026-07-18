"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "./GlassCard";
import { GLASS_CARDS } from "@/lib/constants";

export function GlassCardStack() {
  const stackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    const stack = stackRef.current;
    if (!section || !stack) return;

    const cards = stack.querySelectorAll(".glass-card");
    if (!cards.length) return;

    let mx = 0.5;
    let my = 0.5;
    let parallaxActive = false;

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.set(card, {
          z: -i * 40,
          rotateX: -4 + i * 2,
          y: i * 8,
          x: i * 4 - 8,
        });
      });

      gsap.to(cards, {
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onEnter: () => {
            parallaxActive = true;
          },
          onEnterBack: () => {
            parallaxActive = true;
          },
          onLeave: () => {
            parallaxActive = false;
          },
          onLeaveBack: () => {
            parallaxActive = false;
          },
        },
        y: (i) => -80 + i * 55,
        x: (i) => -60 + i * 30,
        rotateX: 0,
        rotateZ: (i) => -6 + i * 3,
        z: (i) => i * 30,
        stagger: 0.02,
        ease: "none",
      });
    }, section);

    const mouseHandler = (e: MouseEvent) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    };

    document.addEventListener("mousemove", mouseHandler, { passive: true });

    const tickerHandler = () => {
      if (!parallaxActive) return;
      cards.forEach((card, i) => {
        const d = (i + 1) * 0.4;
        gsap.set(card, {
          rotateY: mx * 8 * d,
          rotateX: -my * 6 * d,
        });
      });
    };

    gsap.ticker.add(tickerHandler);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerHandler);
      document.removeEventListener("mousemove", mouseHandler);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="insights"
      className="relative z-10 bg-[var(--background)]"
    >
      <div className="pt-24 text-center">
        <SectionHeading
          eyebrow="Spatial insights"
          title="Data that feels tangible."
          subtitle="One scan — layered insights. Scroll to unfold the report stack."
        />
      </div>

      <div style={{ height: reducedMotion ? "auto" : "220vh" }}>
        <div
          className="sticky top-[var(--header-height)] flex h-[calc(100vh-var(--header-height))] items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          <div
            ref={stackRef}
            className="relative w-[min(520px,92vw)]"
            style={{ height: reducedMotion ? "auto" : "520px" }}
          >
            {GLASS_CARDS.map((card) => (
              <GlassCard
                key={card.label}
                label={card.label}
                value={card.value}
                hint={card.hint}
                color={card.color}
                className="glass-card"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CTAPrimary } from "@/components/shared/CTAPrimary";
import { CTASecondary } from "@/components/shared/CTASecondary";

export function HeroContent() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1.2, delay: 0.2 })
      .to(leadRef.current, { opacity: 1, y: 0, duration: 1 }, 0.7)
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8 }, 1.0);

    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  return (
    <div className="relative z-10 flex flex-col items-center text-center px-6">
      <h1
        id="heroTitle"
        ref={titleRef}
        className={`text-balance text-[clamp(36px,7vw,72px)] font-semibold leading-[1.05] tracking-[-0.04em] ${
          reducedMotion ? "opacity-100" : "opacity-0 translate-y-[30px]"
        }`}
      >
        See Your Body.
        <br />
        In a New Dimension.
      </h1>

      <p
        id="heroLead"
        ref={leadRef}
        className={`mt-5 max-w-[520px] text-balance text-[clamp(17px,2.5vw,21px)] font-light leading-relaxed text-[var(--text-muted)] ${
          reducedMotion ? "opacity-100" : "opacity-0 translate-y-[20px]"
        }`}
      >
        NextBody brings spatial-grade body intelligence to premium gyms — from
        scan to digital twin, seamlessly.
      </p>

      <div
        ref={ctaRef}
        className={`mt-10 flex flex-wrap items-center justify-center gap-4 ${
          reducedMotion ? "opacity-100" : "opacity-0 translate-y-[10px]"
        }`}
      >
        <CTAPrimary href="/contact">Book a Demo</CTAPrimary>
        <CTASecondary href="#closer-look" icon>
          Take a closer look
        </CTASecondary>
      </div>
    </div>
  );
}

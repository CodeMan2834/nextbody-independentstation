"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MediaBlock } from "@/components/shared/MediaBlock";
import { CUSTOMER_CASES } from "@/lib/products";

export function CustomerCases() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(".case-card"), {
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 32,
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="cases"
      className="relative z-10 border-t border-[var(--surface-border)] bg-[var(--background)] py-24 md:py-32"
      aria-label="Customer cases"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow="Customer cases"
          title="Trusted by operators across MENA & Southeast Asia."
          subtitle="Real deployments in premium fitness, rehabilitation, and wellness."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {CUSTOMER_CASES.map((item) => (
            <article
              key={item.id}
              className="case-card overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--card)]"
            >
              <MediaBlock
                src={item.media.src}
                alt={item.media.alt}
                pending={item.placeholder}
                pendingLabel="Case photo pending"
                overlay="heavy"
                className="rounded-none border-0 border-b border-[var(--surface-border)]"
              />
              <div className="p-6 md:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--brand)]/15 px-3 py-1 text-xs font-medium text-[var(--brand-accent)]">
                    {item.industry}
                  </span>
                  <span className="text-xs text-[var(--text-dim)]">
                    {item.region}
                  </span>
                  <span className="text-xs text-[var(--text-dim)]">·</span>
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    NextBody {item.product}
                  </span>
                </div>

                <h3 className="text-xl font-semibold tracking-[-0.02em]">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-[var(--brand-accent)]/90">
                  {item.headline}
                </p>

                <div className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  <p>
                    <span className="font-medium text-[var(--text-primary)]">
                      Challenge ·{" "}
                    </span>
                    {item.challenge}
                  </p>
                  <p>
                    <span className="font-medium text-[var(--text-primary)]">
                      Solution ·{" "}
                    </span>
                    {item.solution}
                  </p>
                  <p className="rounded-lg border border-[var(--surface-border)] bg-white/[0.02] p-3 text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-primary)]">
                      Outcome ·{" "}
                    </span>
                    {item.outcome}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

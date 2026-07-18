"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MediaBlock } from "@/components/shared/MediaBlock";
import { WHY_CHAPTERS } from "@/lib/constants";

export function WhyNextBody() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Chapter blocks — fade in + slight scale
      const blocks = section.querySelectorAll(".chapter-block");
      blocks.forEach((block) => {
        const mediaWrap = block.querySelector(".chapter-media-wrap");
        gsap.from(block, {
          scrollTrigger: {
            trigger: block,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 36,
          duration: 0.9,
          ease: "power2.out",
        });
        // Subtle scale-in for the image within the block
        if (mediaWrap) {
          gsap.from(mediaWrap, {
            scrollTrigger: {
              trigger: block,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
            scale: 0.92,
            duration: 1.0,
            ease: "power2.out",
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="why-nextbody"
      className="relative z-10 bg-black"
      aria-label="Why NextBody"
    >
      {WHY_CHAPTERS.map((chapter) => (
        <div key={chapter.id} className="chapter border-t border-[var(--surface-border)]">
          <div className="container-site flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center md:min-h-[60vh] md:py-24">
            <span className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-accent)]">
              {chapter.eyebrow}
            </span>
            <h2 className="max-w-[780px] text-balance text-[clamp(28px,4.5vw,52px)] font-semibold leading-[1.08] tracking-[-0.03em]">
              {chapter.title}
            </h2>
          </div>

          <div className="container-site space-y-20 pb-20 md:space-y-28 md:pb-28">
            {chapter.blocks.map((block) => (
              <div
                key={block.title}
                className={`chapter-block grid items-center gap-8 md:gap-12 ${
                  block.align === "right"
                    ? "md:grid-cols-[1fr_1.15fr]"
                    : "md:grid-cols-[1.15fr_1fr]"
                }`}
              >
                <div
                  className={
                    block.align === "left"
                      ? "order-2 md:order-2"
                      : "order-2 md:order-1"
                  }
                >
                  <h3 className="text-[clamp(22px,3vw,32px)] font-semibold tracking-[-0.02em]">
                    {block.title}
                  </h3>
                  <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-[var(--text-muted)]">
                    {block.body}
                  </p>
                </div>
                <div
                  className={`chapter-media-wrap ${
                    block.align === "left"
                      ? "order-1 md:order-1"
                      : "order-1 md:order-2"
                  }`}
                >
                  <MediaBlock
                    src={block.media.src}
                    fallback={block.media.fallback}
                    alt={block.media.alt}
                    pending={"pending" in block.media && block.media.pending}
                    padding="sm"
                    overlay="subtle"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

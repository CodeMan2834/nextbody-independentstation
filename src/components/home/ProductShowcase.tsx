"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  PRODUCT_DETAIL_STEPS,
  PRODUCT_MODELS,
} from "@/lib/constants";
import { PRODUCTS } from "@/lib/products";

export function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const deviceWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const annotationRef = useRef<HTMLDivElement>(null);
  const annotationLabelRef = useRef<HTMLSpanElement>(null);
  const modelPillsRef = useRef<HTMLDivElement>(null);
  const stepNavRef = useRef<HTMLDivElement>(null);
  const stepDotsRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    const deviceWrap = deviceWrapRef.current;
    if (!section || !deviceWrap) return;

    let lastStep = -1;
    let lastModel = -1;

    const applyStep = (stepIndex: number) => {
      if (stepIndex === lastStep) return;
      lastStep = stepIndex;

      const step = PRODUCT_DETAIL_STEPS[stepIndex];
      if (titleRef.current) titleRef.current.textContent = step.title;
      if (descRef.current) descRef.current.textContent = step.description;

      if (annotationRef.current && annotationLabelRef.current) {
        if (step.annotation) {
          annotationRef.current.style.left = step.annotation.x;
          annotationRef.current.style.top = step.annotation.y;
          annotationLabelRef.current.textContent = step.annotation.label;
          annotationRef.current.style.opacity = "1";
        } else {
          annotationRef.current.style.opacity = "0";
        }
      }

      stepNavRef.current?.querySelectorAll("[data-step]").forEach((el, i) => {
        el.classList.toggle("border-[var(--brand-accent)]/40", i === stepIndex);
        el.classList.toggle("bg-[var(--brand)]/10", i === stepIndex);
        el.classList.toggle("opacity-40", i !== stepIndex);
        el.classList.toggle("border-transparent", i !== stepIndex);
      });

      stepDotsRef.current?.querySelectorAll("[data-dot]").forEach((el, i) => {
        el.classList.toggle("bg-[var(--brand-accent)]", i === stepIndex);
        el.classList.toggle("bg-white/10", i !== stepIndex);
      });
    };

    const applyModel = (modelIndex: number) => {
      if (modelIndex === lastModel) return;
      lastModel = modelIndex;

      modelPillsRef.current?.querySelectorAll("[data-model]").forEach((el, i) => {
        el.classList.toggle("bg-[var(--brand)]/20", i === modelIndex);
        el.classList.toggle("text-[var(--brand-accent)]", i === modelIndex);
        el.classList.toggle("text-[var(--text-dim)]", i !== modelIndex);
      });

      imageRefs.current.forEach((img, i) => {
        if (!img) return;
        img.style.opacity = i === modelIndex ? "1" : "0";
      });

      const meta = PRODUCT_MODELS[modelIndex];
      const product = PRODUCTS[meta.slug];
      if (taglineRef.current) {
        if (modelIndex === 1) {
          taglineRef.current.textContent = product.tagline;
          taglineRef.current.style.opacity = "1";
        } else {
          taglineRef.current.style.opacity = "0";
        }
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          const stepIndex = Math.min(
            PRODUCT_DETAIL_STEPS.length - 1,
            Math.floor(p * PRODUCT_DETAIL_STEPS.length)
          );
          const modelIndex = p > 0.78 ? 1 : 0;

          gsap.set(deviceWrap, {
            scale: 0.88 + p * 0.14,
            rotateY: -8 + p * 10,
            rotateX: 4 - p * 6,
            y: 20 - p * 30,
          });

          applyStep(stepIndex);
          applyModel(modelIndex);
        },
      });
    }, section);

    applyStep(0);
    applyModel(0);

    return () => ctx.revert();
  }, [reducedMotion]);

  const initialStep = PRODUCT_DETAIL_STEPS[0];

  if (reducedMotion) {
    return (
      <section
        id="closer-look"
        className="relative z-10 bg-[var(--background)] py-24 md:py-32"
      >
        <div className="container-site">
          <header className="mb-12 text-center">
            <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-accent)]">
              Take a closer look
            </span>
            <h2 className="text-balance text-[clamp(28px,5vw,48px)] font-semibold tracking-[-0.03em]">
              {initialStep.title}
            </h2>
          </header>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              {PRODUCT_DETAIL_STEPS.map((s) => (
                <div key={s.id}>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="relative inline-block">
                <div
                  className="absolute inset-0 rounded-[28px]"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,102,255,0.2) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.9) 100%)",
                    filter: "blur(12px)",
                  }}
                />
                <Image
                  src={PRODUCT_MODELS[0].image}
                  alt="NextBody S30"
                  width={300}
                  height={400}
                  className="relative w-[min(280px,70vw)] rounded-[24px] drop-shadow-[0_24px_70px_rgba(0,102,255,0.4)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="closer-look"
      ref={sectionRef}
      className="relative z-10 bg-[var(--background)]"
      style={{ height: "260vh" }}
      aria-label="Product closer look"
    >
      <div className="sticky top-[var(--header-height)] flex h-[calc(100vh-var(--header-height))] flex-col items-center justify-center overflow-hidden px-6">
        <header className="mb-6 text-center md:mb-8">
          <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-accent)]">
            Take a closer look
          </span>
        </header>

        <div className="grid w-full max-w-[1100px] flex-1 items-center gap-8 md:grid-cols-[1fr_minmax(280px,420px)_1fr] md:gap-4">
          <div className="order-2 text-center md:order-1 md:text-start">
            <div
              ref={modelPillsRef}
              className="mb-3 flex flex-wrap justify-center gap-2 md:justify-start"
            >
              {PRODUCT_MODELS.map((m, i) => (
                <span
                  key={m.id}
                  data-model={i}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    i === 0
                      ? "bg-[var(--brand)]/20 text-[var(--brand-accent)]"
                      : "text-[var(--text-dim)]"
                  }`}
                >
                  {m.label}
                </span>
              ))}
            </div>
            <h2
              ref={titleRef}
              className="text-balance text-[clamp(24px,3.5vw,40px)] font-semibold leading-[1.08] tracking-[-0.03em]"
            >
              {initialStep.title}
            </h2>
            <p
              ref={descRef}
              className="mt-4 max-w-[380px] text-pretty text-[15px] leading-relaxed text-[var(--text-muted)] md:mx-0 mx-auto"
            >
              {initialStep.description}
            </p>
            <p
              ref={taglineRef}
              className="mt-3 text-sm text-[var(--brand-accent)]/80 opacity-0 transition-opacity"
            />
          </div>

          <div className="relative order-1 flex items-center justify-center md:order-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-[min(420px,72vw)] rounded-full border border-[var(--brand-accent)]/10" />
            </div>
            <div
              ref={deviceWrapRef}
              className="relative will-change-transform"
              style={{ perspective: "900px", transformStyle: "preserve-3d" }}
            >
              <div className="relative">
                {PRODUCT_MODELS.map((m, i) => {
                  const product = PRODUCTS[m.slug];
                  return (
                    <div
                      key={m.id}
                      className={`${
                        i === 0 ? "relative opacity-100" : "absolute inset-0 opacity-0"
                      } transition-opacity duration-300`}
                    >
                      {/* Dark glow behind product for edge blending */}
                      <div
                        className="absolute inset-0 rounded-[28px]"
                        style={{
                          background:
                            "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,102,255,0.2) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.9) 100%)",
                          filter: "blur(12px)",
                        }}
                      />
                      <Image
                        ref={(el) => {
                          imageRefs.current[i] = el;
                        }}
                        src={product.image}
                        alt={`NextBody ${m.label}`}
                        width={300}
                        height={400}
                        priority={i === 0}
                        className="relative w-[min(280px,55vw)] rounded-[24px] drop-shadow-[0_24px_70px_rgba(0,102,255,0.45)]"
                      />
                    </div>
                  );
                })}
              </div>
              <div
                ref={annotationRef}
                className="pointer-events-none absolute opacity-0 transition-opacity duration-300"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-[var(--brand-accent)] shadow-[0_0_12px_rgba(0,229,255,0.8)]" />
                  <span
                    ref={annotationLabelRef}
                    className="whitespace-nowrap rounded-md border border-[var(--brand-accent)]/25 bg-[rgba(4,8,20,0.85)] px-2.5 py-1 text-[11px] font-medium text-[var(--brand-accent)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            ref={stepNavRef}
            className="order-3 hidden md:flex md:flex-col md:justify-center md:gap-3"
          >
            {PRODUCT_DETAIL_STEPS.map((s, i) => (
              <div
                key={s.id}
                data-step={i}
                className={`rounded-lg border px-4 py-3 transition-colors duration-300 ${
                  i === 0
                    ? "border-[var(--brand-accent)]/40 bg-[var(--brand)]/10"
                    : "border-transparent bg-white/[0.02] opacity-40"
                }`}
              >
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div ref={stepDotsRef} className="mt-4 flex gap-1.5 md:hidden">
          {PRODUCT_DETAIL_STEPS.map((s, i) => (
            <span
              key={s.id}
              data-dot={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === 0 ? "bg-[var(--brand-accent)]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

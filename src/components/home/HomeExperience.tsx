"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, Download } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FLAGSHIP_PRODUCT, SUPPORTING_PRODUCTS } from "@/lib/products";

const scanStages = [
  ["01", "CAPTURE", "The body enters as a whole.", "A guided session brings posture, segmental composition and neck-shoulder mobility into one controlled assessment."],
  ["02", "RECONSTRUCT", "Structure becomes measurable.", "Depth vision maps anatomical landmarks while professionals retain control of the final review."],
  ["03", "INTERPRET", "Results become a next action.", "A continuous record turns complex body data into findings that can be reviewed, explained and shared."],
] as const;

const intelligenceViews = [
  ["Posture", "Alignment in context", "/media/products/x60/x60-analysis.png"],
  ["Composition", "Segmental body detail", "/media/products/x60/x60-composition.png"],
  ["Mobility", "Movement made reviewable", "/media/products/x60/x60-mobility.png"],
] as const;

export function HomeExperience() {
  const root = useRef<HTMLDivElement>(null);
  const scanSection = useRef<HTMLElement>(null);
  const [activeView, setActiveView] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveView((view) => (view + 1) % intelligenceViews.length), 4800);
    return () => window.clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !root.current || !scanSection.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(".cinematic-hero-copy > *", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.05, stagger: 0.09, ease: "power3.out", delay: 0.18 });
      gsap.to(".cinematic-hero-video", { scale: 1.07, yPercent: 5, ease: "none", scrollTrigger: { trigger: ".cinematic-hero", start: "top top", end: "bottom top", scrub: 1 } });

      gsap.timeline({ scrollTrigger: { trigger: scanSection.current, start: "top top", end: "+=240%", pin: true, scrub: 0.8, anticipatePin: 1 } })
        .fromTo(".scan-body-image", { scale: 1.08, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 1 })
        .fromTo(".scan-plane", { yPercent: -120 }, { yPercent: 145, duration: 2.5, ease: "none" }, 0)
        .to(".scan-grid", { opacity: 0.7, duration: 0.65 }, 0.65)
        .to(".scan-stage-0", { opacity: 0, y: -18, duration: 0.25 }, 0.75)
        .fromTo(".scan-stage-1", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.3 }, 0.9)
        .to(".scan-body-image", { filter: "saturate(0.65) contrast(1.12) hue-rotate(8deg)", duration: 0.8 }, 1)
        .to(".scan-stage-1", { opacity: 0, y: -18, duration: 0.25 }, 1.7)
        .fromTo(".scan-stage-2", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.3 }, 1.88)
        .to(".scan-data", { opacity: 1, duration: 0.45 }, 1.8);
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div className="cinematic-home" ref={root}>
      <section className="cinematic-hero" aria-labelledby="home-title">
        <video className="cinematic-hero-video" autoPlay muted loop playsInline preload="metadata" poster="/media/products/x60/x60-device.png" aria-label="NEXBODY X60 product film">
          <source src="/video/x60-hero-animatic-v1.mp4?v=2" type="video/mp4" />
        </video>
        <div className="cinematic-hero-grade" />
        <div className="cinematic-hero-optics" aria-hidden="true"><span /><span /></div>
        <div className="container-site cinematic-hero-shell">
          <div className="cinematic-hero-copy">
            <p className="cinematic-overline">NEXBODY X60 / BODY INTELLIGENCE STATION</p>
            <h1 id="home-title">See the whole body.<br /><em>Know what comes next.</em></h1>
            <p className="cinematic-lead">One guided assessment for posture, segmental body composition and neck-shoulder mobility.</p>
            <div className="cinematic-actions"><Link href="/products/nexbody-x60">Experience X60 <ArrowRight aria-hidden="true" /></Link><Link href="/contact">Book a demonstration</Link></div>
          </div>
          <div className="cinematic-hero-status" aria-label="X60 measurement system"><span>3D DEPTH VISION</span><span>8-ELECTRODE BIA</span><span>GUIDED REPORTING</span></div>
        </div>
        <a className="cinematic-scroll" href="#scan-story"><span>Enter the scan</span><ArrowDown aria-hidden="true" /></a>
      </section>

      <section className="scan-story" id="scan-story" ref={scanSection} aria-label="How X60 turns a scan into body intelligence">
        <div className="scan-visual" aria-hidden="true">
          <Image className="scan-body-image" src="/media/products/x60/x60-analysis.png" alt="" fill sizes="100vw" priority />
          <div className="scan-grid" /><div className="scan-plane" />
          <div className="scan-data"><span style={{ "--x": "18%", "--y": "25%" } as CSSProperties}>ALIGNMENT</span><span style={{ "--x": "66%", "--y": "38%" } as CSSProperties}>COMPOSITION</span><span style={{ "--x": "28%", "--y": "71%" } as CSSProperties}>MOBILITY</span></div>
        </div>
        <div className="scan-vignette" />
        <div className="container-site scan-story-shell">
          <div className="scan-story-title"><p>X60 / 32-SECOND WORKFLOW</p><span>SCROLL TO EXAMINE</span></div>
          <div className="scan-stage-stack">
            {scanStages.map(([index, label, title, body], stageIndex) => <article className={`scan-stage scan-stage-${stageIndex}`} key={index}><p><span>{index}</span>{label}</p><h2>{title}</h2><div>{body}</div></article>)}
          </div>
        </div>
      </section>

      <section className="intelligence-section">
        <div className="container-site intelligence-heading"><p className="cinematic-overline">ONE RECORD / THREE CLINICAL VIEWS</p><h2>Data should feel less like output.<br /><em>More like understanding.</em></h2></div>
        <div className="container-site intelligence-showcase">
          <div className="intelligence-stage">
            {intelligenceViews.map(([label, title, image], index) => <article className={`intelligence-card${activeView === index ? " is-active" : ""}`} aria-hidden={activeView !== index} key={label}><Image src={image} alt={`${label} assessment result`} fill sizes="(min-width: 900px) 1200px, 100vw" /><div className="intelligence-card-grade" /><div className="intelligence-card-copy"><span>0{index + 1} / {label}</span><h3>{title}</h3></div></article>)}
          </div>
          <div className="intelligence-nav" aria-label="Assessment views">
            {intelligenceViews.map(([label], index) => <button className={activeView === index ? "is-active" : ""} type="button" onClick={() => setActiveView(index)} aria-pressed={activeView === index} key={label}><span>0{index + 1}</span>{label}</button>)}
          </div>
        </div>
      </section>

      <section className="ecosystem-section" id="products">
        <div className="container-site ecosystem-heading"><div><p className="cinematic-overline">NEXBODY ECOSYSTEM</p><h2>One body.<br />The right instrument.</h2></div><p>X60 leads the assessment. OneScan and F20 extend the view into gait and foot geometry when the workflow requires it.</p></div>
        <div className="container-site ecosystem-grid">
          {SUPPORTING_PRODUCTS.map((product) => <Link className="ecosystem-card" href={`/products/${product.slug}`} key={product.slug}><div className="ecosystem-media"><Image src={product.image} alt={product.name} fill sizes="(min-width: 900px) 50vw, 100vw" className="object-cover" /></div><div className="ecosystem-copy"><span>{product.category}</span><h3>{product.shortName}</h3><p>{product.summary}</p><b>Explore system <ArrowRight aria-hidden="true" /></b></div></Link>)}
        </div>
      </section>

      <section className="cinematic-resources" id="resources"><div className="container-site cinematic-resource-shell"><div><p className="cinematic-overline">PRODUCT RESOURCES</p><h2>Take the system<br />into review.</h2></div><div className="cinematic-resource-links">{FLAGSHIP_PRODUCT.downloads.map((download) => <a href={download.href} key={download.href} target="_blank" rel="noreferrer"><Download aria-hidden="true" /><span>{download.label}</span><ArrowRight aria-hidden="true" /></a>)}</div></div></section>
      <section className="cinematic-final"><div className="container-site"><p className="cinematic-overline">SEE X60 IN YOUR WORKFLOW</p><h2>The next assessment<br />starts with a clearer view.</h2><Link href="/contact">Book a demonstration <ArrowRight aria-hidden="true" /></Link></div></section>
    </div>
  );
}

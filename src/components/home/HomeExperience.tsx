"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SUPPORTING_PRODUCTS } from "@/lib/products";
import { HOME_CONTENT } from "@/lib/home-content";
import { HOME_CASES } from "@/lib/home-cases";

const supportingProductLabels: Record<string, string> = {
  "onescan-gait-analysis": "Plantar pressure & gait assessment",
  "f20-foot-scanner": "3D full-foot scanning",
};

type HeroMediaItem = {
  type: "video" | "image";
  src: string;
  poster?: string;
  alt: string;
  duration?: number;
};

export function HomeExperience() {
  const heroMedia = HOME_CONTENT.hero.media as HeroMediaItem[];
  const [activeHeroMedia, setActiveHeroMedia] = useState(0);
  const heroVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    heroVideoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeHeroMedia) {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [activeHeroMedia]);

  useEffect(() => {
    if (heroMedia.length <= 1) return;

    const configuredDuration = heroMedia[activeHeroMedia]?.duration ?? 6500;
    const duration = Math.max(3000, configuredDuration);
    const timer = window.setTimeout(() => {
      setActiveHeroMedia((current) => (current + 1) % heroMedia.length);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [activeHeroMedia, heroMedia]);

  return (
    <div className="cinematic-home">
      <section className="cinematic-hero" aria-labelledby="home-title">
        <div className="cinematic-hero-media" aria-hidden="true">
          {heroMedia.map((media, index) => (
            <div
              className={`cinematic-hero-slide cinematic-hero-slide-${media.type}${index === activeHeroMedia ? " is-active" : ""}`}
              key={`${media.type}-${media.src}`}
            >
              {media.type === "image" ? (
                <Image className="cinematic-hero-image" src={media.src} alt="" fill priority={index === 0} sizes="100vw" />
              ) : (
                <video ref={(video) => { heroVideoRefs.current[index] = video; }} className="cinematic-hero-video" muted loop playsInline preload={index === 0 ? "auto" : "metadata"} poster={media.poster}>
                  <source src={media.src} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
        </div>
        <div className="cinematic-hero-grade" /><div className="cinematic-hero-optics" aria-hidden="true"><span /><span /></div>
        <div className="container-site cinematic-hero-shell"><div className="cinematic-hero-copy"><p className="cinematic-overline">{HOME_CONTENT.hero.overline}</p><h1 id="home-title">{HOME_CONTENT.hero.title}<br /><em>{HOME_CONTENT.hero.accentTitle}</em></h1><p className="cinematic-lead">{HOME_CONTENT.hero.lead}</p><div className="cinematic-actions"><Link href={HOME_CONTENT.hero.primaryCta.href}>{HOME_CONTENT.hero.primaryCta.label} <ArrowRight aria-hidden="true" /></Link><Link href={HOME_CONTENT.hero.secondaryCta.href}>{HOME_CONTENT.hero.secondaryCta.label}</Link></div></div><div className="cinematic-hero-meta"><div className="cinematic-hero-status" aria-label="X60 measurement system">{HOME_CONTENT.hero.statusItems.map((item) => <span key={item}>{item}</span>)}</div>{heroMedia.length > 1 && <div className="cinematic-hero-pagination" aria-label="首页媒体轮播">{heroMedia.map((media, index) => <button type="button" className={index === activeHeroMedia ? "is-active" : ""} onClick={() => setActiveHeroMedia(index)} aria-label={`查看第 ${index + 1} 组媒体：${media.alt}`} aria-current={index === activeHeroMedia ? "true" : undefined} key={`${media.src}-control`}><span /></button>)}</div>}</div></div>
        <a className="cinematic-scroll" href="#workflow"><span>Explore the system</span><ArrowDown aria-hidden="true" /></a>
      </section>

      <section className="value-pillars-section" aria-labelledby="value-pillars-title"><div className="container-site value-pillars-heading"><p className="cinematic-overline">{HOME_CONTENT.valuePillars.eyebrow}</p><h2 id="value-pillars-title">{HOME_CONTENT.valuePillars.title}</h2></div><div className="container-site value-pillars-grid">{HOME_CONTENT.valuePillars.items.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>

      <section className="workflow-editorial" id="workflow" aria-labelledby="workflow-title"><div className="container-site workflow-editorial-grid"><div className="workflow-editorial-media"><video autoPlay muted loop playsInline preload="metadata" poster="/media/products/x60/x60-workflow.png" aria-label="NEXBODY X60 clinical posture assessment"><source src="/video/x60-clinical-workflow.mp4" type="video/mp4" /></video><div className="workflow-media-grade" /><span>X60 / POSTURE ASSESSMENT</span></div><div className="workflow-editorial-copy"><p className="cinematic-overline">{HOME_CONTENT.workflow.eyebrow}</p><h2 id="workflow-title">From capture to a conversation people can act on.</h2><div className="workflow-step-list">{HOME_CONTENT.workflow.items.map((item) => <article key={item.index}><span>{item.index}</span><div><small>{item.label}</small><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div></div></div></section>

      <section className="intelligence-section" aria-labelledby="intelligence-title"><div className="container-site intelligence-heading"><p className="cinematic-overline">{HOME_CONTENT.assessment.eyebrow}</p><h2 id="intelligence-title">{HOME_CONTENT.assessment.title}<br /><em>{HOME_CONTENT.assessment.accentTitle}</em></h2><p>Each view is shown in full, preserving the reporting interface and the context around every measurement.</p></div><div className="container-site intelligence-gallery">{HOME_CONTENT.assessment.views.map((view, index) => <article className={index === 0 ? "intelligence-panel intelligence-panel-featured" : "intelligence-panel"} key={view.label}><div className="intelligence-panel-media"><Image src={view.image} alt={`${view.label} assessment result`} fill sizes={index === 0 ? "(min-width: 900px) 70vw, 100vw" : "(min-width: 900px) 35vw, 100vw"} /></div><div className="intelligence-panel-copy"><span>0{index + 1} / {view.label}</span><h3>{view.title}</h3></div></article>)}</div></section>

      <section className="field-film-section" aria-label="NEXBODY product experience"><video autoPlay muted loop playsInline preload="metadata" poster="/media/products/f20/f20-lab-hero-branded.png"><source src="/video/f20-intro.mp4" type="video/mp4" /></video><div className="field-film-grade" /><div className="container-site field-film-copy"><p className="cinematic-overline">MEASUREMENT MADE TANGIBLE</p><h2>From the body<br />to a usable model.</h2><p>Purpose-built capture, clear visual reporting and outputs designed to continue into professional workflows.</p><Link href="/products/f20-foot-scanner">Explore F20 <ArrowRight aria-hidden="true" /></Link></div></section>

      <section className="ecosystem-section" id="products"><div className="container-site ecosystem-heading"><div><p className="cinematic-overline">NEXBODY ECOSYSTEM</p><h2>One product family;<br />Multiple assessment paths.</h2></div></div><div className="container-site ecosystem-grid">{SUPPORTING_PRODUCTS.map((product) => <Link className="ecosystem-card" href={`/products/${product.slug}`} key={product.slug}><div className="ecosystem-media"><Image src={product.image} alt={product.name} fill sizes="(min-width: 900px) 50vw, 100vw" /></div><div className="ecosystem-copy"><span>{supportingProductLabels[product.slug] ?? product.category}</span><h3>{product.shortName}</h3><p>{product.summary}</p><b>Explore system <ArrowRight aria-hidden="true" /></b></div></Link>)}</div></section>

      <section className="case-section" aria-labelledby="case-title"><div className="container-site case-heading"><div><p className="cinematic-overline">WORKFLOWS IN CONTEXT</p><h2 id="case-title">Designed around the moment the result is used.</h2></div><p>Existing product and environment assets now show how each system fits a professional setting, from intake to review and onward action.</p></div><div className="container-site case-grid">{HOME_CASES.map((item, index) => <article className={index === 0 ? "case-card case-card-wide" : "case-card"} key={item.id}><div className="case-card-media"><Image src={item.media.src} alt={item.media.alt} fill sizes={index === 0 ? "(min-width: 900px) 66vw, 100vw" : "(min-width: 900px) 34vw, 100vw"} /></div><div className="case-card-copy"><span>{item.context} / {item.product}</span><h3>{item.headline}</h3><p>{item.result}</p></div></article>)}</div></section>

      <section className="industry-section" id="applications" aria-labelledby="industry-title"><div className="container-site industry-layout"><header><p className="cinematic-overline">{HOME_CONTENT.industries.eyebrow}</p><h2 id="industry-title">{HOME_CONTENT.industries.title}</h2><p>{HOME_CONTENT.industries.intro}</p></header><div className="industry-grid">{HOME_CONTENT.industries.items.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></div></section>
      <section className="service-section" aria-labelledby="service-title"><div className="container-site service-heading"><p className="cinematic-overline">{HOME_CONTENT.service.eyebrow}</p><h2 id="service-title">{HOME_CONTENT.service.title}</h2></div><div className="container-site service-grid">{HOME_CONTENT.service.items.map((item, index) => <article key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div></section>
      <section className="faq-section" aria-labelledby="faq-title"><div className="container-site faq-layout"><header><p className="cinematic-overline">{HOME_CONTENT.faq.eyebrow}</p><h2 id="faq-title">{HOME_CONTENT.faq.title}</h2></header><div className="faq-list">{HOME_CONTENT.faq.items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>
      <section className="cinematic-resources" id="consultation"><div className="container-site cinematic-resource-shell"><div><p className="cinematic-overline">{HOME_CONTENT.cta.eyebrow}</p><h2>{HOME_CONTENT.cta.title}</h2><p className="cinematic-resource-body">{HOME_CONTENT.cta.body}</p></div><div className="cinematic-resource-links"><Link href={HOME_CONTENT.cta.buttonHref}><span>{HOME_CONTENT.cta.buttonLabel}</span><ArrowRight aria-hidden="true" /></Link></div></div></section>
      <section className="cinematic-final"><div className="container-site"><p className="cinematic-overline">{HOME_CONTENT.finalCta.eyebrow}</p><h2>{HOME_CONTENT.finalCta.title}</h2><Link href={HOME_CONTENT.finalCta.buttonHref}>{HOME_CONTENT.finalCta.buttonLabel} <ArrowRight aria-hidden="true" /></Link></div></section>
    </div>
  );
}

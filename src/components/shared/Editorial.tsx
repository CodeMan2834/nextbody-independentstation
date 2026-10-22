import Link from "next/link";
import { HeadingText } from "./HeadingText";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function EditorialHero({ eyebrow, title, intro, image }: { eyebrow: string; title: string; intro: string; image?: string }) {
  return <header className={image ? "editorial-hero editorial-hero-split" : "editorial-hero"}>
    <div><Link href="/" className="editorial-home">Home</Link><p className="instrument-kicker">{eyebrow}</p><h1><HeadingText text={title} /></h1><p className="editorial-intro">{intro}</p></div>
    {image && <div className="editorial-hero-image"><Image src={image} alt={title} fill priority sizes="(min-width: 900px) 45vw, 100vw" className="object-contain p-4" /></div>}
  </header>;
}
export function EditorialSections({ sections }: { sections: { title: string; body: string }[] }) {
  return <div className="editorial-sections">{sections.map((section) => <section key={section.title}><h2>{section.title}</h2><div>{section.body.split(/\n+/).filter(Boolean).map((paragraph,index) => <p key={index}>{paragraph}</p>)}</div></section>)}</div>;
}
export function EditorialCTA() {
  return <aside className="editorial-cta"><div><p className="instrument-kicker">LET’S TALK</p><h2>Find the right assessment for your team.</h2></div><Link href="/contact">Book a demonstration <ArrowRight size={18} aria-hidden="true" /></Link></aside>;
}

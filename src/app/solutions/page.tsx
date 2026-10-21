import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EDITORIAL, SOLUTIONS } from "@/lib/editorial";
import { EditorialHero, EditorialCTA } from "@/components/shared/Editorial";
export const metadata: Metadata = { title: "Solutions", description: EDITORIAL.solutionsIntro, alternates: { canonical: "/solutions" } };
export default function SolutionsPage() { return <div className="page-shell editorial-page"><div className="container-site"><EditorialHero eyebrow="SOLUTIONS" title="Your setting. A clearer assessment." intro={EDITORIAL.solutionsIntro} /><div className="editorial-grid">{SOLUTIONS.map((item) => <Link href={`/solutions/${item.slug}`} key={item.slug} className="editorial-card"><div className="editorial-card-image"><Image src={item.image} alt={item.title} fill sizes="(min-width: 900px) 32vw, (min-width: 600px) 50vw, 100vw" className="object-contain p-4" /></div><div className="editorial-card-copy"><h2>{item.title}</h2><p>{item.intro}</p><span>Explore solution →</span></div></Link>)}</div><EditorialCTA /></div></div>; }

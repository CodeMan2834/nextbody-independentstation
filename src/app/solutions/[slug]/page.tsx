import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SOLUTIONS } from "@/lib/editorial";
import { PRODUCTS, type ProductSlug } from "@/lib/products";
import { EditorialHero, EditorialSections, EditorialCTA } from "@/components/shared/Editorial";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return SOLUTIONS.map(({slug}) => ({slug})); }
export async function generateMetadata({params}: Props): Promise<Metadata> { const {slug}=await params; const item=SOLUTIONS.find(s => s.slug===slug); if(!item) return {}; return { title: item.title, description: item.intro, alternates: {canonical: `/solutions/${slug}`} }; }
export default async function SolutionPage({params}: Props) { const {slug}=await params; const item=SOLUTIONS.find(s=>s.slug===slug); if(!item) notFound(); return <div className="page-shell editorial-page"><div className="container-site"><EditorialHero eyebrow="SOLUTIONS" {...item} /><Link href="/solutions" className="editorial-back">← All solutions</Link><EditorialSections sections={item.sections} /><section className="editorial-related"><h2>Products for this setting</h2><div>{item.productSlugs.map(slug => { const p=PRODUCTS[slug as ProductSlug]; return p && <Link key={slug} href={`/products/${slug}`}><strong>{p.shortName}</strong><span>{p.category} →</span></Link>; })}</div></section><EditorialCTA /></div></div>; }

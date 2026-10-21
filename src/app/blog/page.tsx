import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EDITORIAL, PUBLISHED_POSTS } from "@/lib/editorial";
import { EditorialHero } from "@/components/shared/Editorial";
export const metadata: Metadata = {title: "Blog", description: EDITORIAL.blogIntro, alternates: {canonical: "/blog"}};
export default function BlogPage() { return <div className="page-shell editorial-page"><div className="container-site"><EditorialHero eyebrow="NEXBODY JOURNAL" title="Understand the assessment." intro={EDITORIAL.blogIntro} /><div className="editorial-grid">{PUBLISHED_POSTS.map(post => <Link href={`/blog/${post.slug}`} key={post.slug} className="editorial-card"><div className="editorial-card-image"><Image src={post.image} alt={post.title} fill sizes="(min-width: 900px) 32vw, (min-width: 600px) 50vw, 100vw" className="object-contain p-4" /></div><div className="editorial-card-copy"><h2>{post.title}</h2><p>{post.summary}</p><span>Read article →</span></div></Link>)}</div>{!PUBLISHED_POSTS.length && <p className="editorial-intro">New assessment guides are on the way. <Link href="/contact">Contact our team</Link> for product information.</p>}</div></div>; }

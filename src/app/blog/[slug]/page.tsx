import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PUBLISHED_POSTS } from "@/lib/editorial";
import { EditorialHero, EditorialSections, EditorialCTA } from "@/components/shared/Editorial";
type Props={params: Promise<{slug:string}>};
export function generateStaticParams(){return PUBLISHED_POSTS.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const post=PUBLISHED_POSTS.find(p=>p.slug===slug);if(!post)return {};return {title:post.title,description:post.summary,alternates:{canonical:`/blog/${slug}`},openGraph:{type:"article",title:post.title,description:post.summary,images:[post.image]}};}
export default async function BlogPost({params}:Props){const {slug}=await params;const post=PUBLISHED_POSTS.find(p=>p.slug===slug);if(!post)notFound();return <article className="page-shell editorial-page"><div className="container-site"><EditorialHero eyebrow="NEXBODY JOURNAL" title={post.title} intro={post.summary} image={post.image} /><Link href="/blog" className="editorial-back">← All articles</Link><EditorialSections sections={post.sections} /><EditorialCTA /></div></article>;}

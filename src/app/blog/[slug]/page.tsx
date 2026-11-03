import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PUBLISHED_POSTS } from "@/lib/editorial";
import { ArticleBody } from "@/components/shared/ArticleBody";
import { EditorialCTA } from "@/components/shared/Editorial";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return PUBLISHED_POSTS.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = PUBLISHED_POSTS.find(p => p.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.summary, alternates: { canonical: `/blog/${slug}` }, openGraph: { type: "article", title: post.title, description: post.summary, images: [post.image], modifiedTime: post.updatedDate } };
}
export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = PUBLISHED_POSTS.find(p => p.slug === slug);
  if (!post) notFound();
  const minutes = Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200));
  const date = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.updatedDate + "T00:00:00Z"));
  const related = PUBLISHED_POSTS.filter(p => p.slug !== slug).slice(0, 2);
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.summary, image: `https://nexbodyfit.com${post.image}`, dateModified: post.updatedDate, author: { "@type": "Organization", name: post.author }, mainEntityOfPage: `https://nexbodyfit.com/blog/${post.slug}` };
  return <article className="page-shell journal-article"><div className="container-site">
    <header className="journal-header"><Link href="/blog" className="journal-back">← All articles</Link><p className="instrument-kicker">NEXBODY JOURNAL</p><h1>{post.title}</h1><p className="journal-summary">{post.summary}</p><div className="journal-meta"><span>{post.author}</span><span>Updated <time dateTime={post.updatedDate}>{date}</time></span><span>{minutes} min read</span></div></header>
    <div className="journal-cover"><Image src={post.image} alt={post.title} fill priority sizes="(min-width: 1100px) 1000px, 100vw" /></div>
    <ArticleBody body={post.body} />
    {related.length > 0 && <section className="journal-related" aria-label="More articles"><p className="instrument-kicker">CONTINUE READING</p><div>{related.map(item => <Link href={`/blog/${item.slug}`} key={item.slug}><h2>{item.title}</h2><p>{item.summary}</p><span>Read article →</span></Link>)}</div></section>}
    <EditorialCTA />
  </div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} /></article>;
}

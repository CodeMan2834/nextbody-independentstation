import type { Metadata } from "next";
import { PAGE_CONTENT } from "@/lib/page-content";
import { siteConfig } from "@/lib/site-config";
const content = PAGE_CONTENT.terms;
export const metadata: Metadata = { title: content.title };
export default function LegalPage() {
  return <div className="relative z-10 page-shell"><div className="container-site"><div className="mx-auto max-w-2xl"><h1 className="text-4xl font-semibold">{content.title}</h1><div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--text-muted)]"><p>{content.intro}</p>{content.sections.map((item) => <section key={item.title} className="space-y-3"><h2 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h2><p className="whitespace-pre-line">{item.body.replaceAll("{{contactEmail}}", siteConfig.contactEmail)}</p></section>)}</div></div></div></div>;
}

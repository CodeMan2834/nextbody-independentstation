import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAPrimary } from "@/components/shared/CTAPrimary";
import { PRODUCTS, PRODUCT_SLUGS, type ProductSlug } from "@/lib/products";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS[slug as ProductSlug];
  if (!product) return { title: "Not Found" };

  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = PRODUCTS[slug as ProductSlug];

  if (!product) {
    notFound();
  }

  return (
    <div className="relative z-10 page-shell">
      <div className="container-site">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-accent)]">
              {product.tagline}
            </span>
            <h1 className="mt-4 text-[clamp(32px,5vw,56px)] font-semibold leading-[1.08] tracking-[-0.03em]">
              {product.name}
            </h1>
            <p className="mt-4 max-w-[520px] text-lg leading-relaxed text-[var(--text-muted)]">
              {product.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--brand)]/15 px-3 py-1 text-xs font-medium text-[var(--brand-accent)]">
                {product.scanTime} scan
              </span>
              <span className="rounded-full bg-[var(--brand)]/15 px-3 py-1 text-xs font-medium text-[var(--brand-accent)]">
                {product.metricCount} metrics
              </span>
            </div>
            <div className="mt-8">
              <CTAPrimary href="/contact">Book a Demo</CTAPrimary>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--brand)]/20 blur-[80px]" />
              {product.heroImagePending && (
                <p className="relative mb-3 text-center text-xs text-[var(--text-dim)]">
                  Product photo pending
                </p>
              )}
              <Image
                src={product.image}
                alt={product.name}
                width={350}
                height={450}
                className="relative drop-shadow-[0_40px_100px_rgba(0,102,255,0.4)]"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-24">
          <SectionHeading title="Key capabilities" align="left" />
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {product.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 rounded-lg border border-[var(--surface-border)] bg-[var(--card)] p-4 text-sm text-[var(--text-muted)]"
              >
                <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[var(--brand-accent)]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-24">
          <SectionHeading title="Report types" align="left" />
          <div className="mt-8 flex flex-wrap gap-3">
            {product.reports.map((report) => (
              <span
                key={report}
                className="rounded-xl border border-[var(--brand-accent)]/20 bg-[var(--brand)]/10 px-4 py-3 text-sm font-medium text-[var(--text-primary)]"
              >
                {report}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--text-dim)]">
            Report UI screenshots pending — replace with approved product marketing assets.
          </p>
        </div>

        <div className="mt-24">
          <SectionHeading title="Specifications" align="left" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-xl border border-[var(--surface-border)] glass p-5"
              >
                <span className="text-xs uppercase tracking-[0.08em] text-[var(--text-dim)]">
                  {spec.label}
                </span>
                <p className="mt-2 text-sm font-semibold leading-snug text-[var(--text-primary)]">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <SectionHeading title="Ideal for" align="left" />
          <div className="mt-8 flex flex-wrap gap-2">
            {product.industries.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-[var(--surface-border)] px-4 py-2 text-sm text-[var(--text-muted)]"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <SectionHeading title="Highlights" align="left" />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 rounded-lg border border-[var(--surface-border)] bg-[var(--card)] p-4 text-sm text-[var(--text-muted)]"
              >
                <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[var(--brand-green)]" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-24 text-center">
          <SectionHeading
            title="Ready to see it in action?"
            subtitle="Book a personalized demo with our team."
          />
          <div className="mt-8">
            <CTAPrimary href="/contact">Book a Demo</CTAPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}

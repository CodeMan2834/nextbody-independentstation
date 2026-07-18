import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAPrimary } from "@/components/shared/CTAPrimary";
import { PRODUCTS, PRODUCT_SLUGS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore NextBody S30 flagship and S20 pro body composition analyzers — hybrid 3D scanning and BIA for premium fitness operators.",
};

export default function ProductsPage() {
  const list = PRODUCT_SLUGS.map((slug) => PRODUCTS[slug]);

  return (
    <div className="relative z-10 page-shell">
      <div className="container-site">
        <SectionHeading
          title="Our Products"
          subtitle="Hybrid 3D body scanning and bioimpedance analysis — from flagship clubs to boutique studios."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {list.map((product) => (
            <div
              key={product.slug}
              className="group rounded-2xl border border-[var(--surface-border)] bg-[var(--card)] p-8 transition-colors hover:border-[var(--brand)]/30"
            >
              <div className="mb-6 flex justify-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={260}
                  className="drop-shadow-[0_20px_60px_rgba(0,102,255,0.3)] transition-transform group-hover:scale-105"
                />
              </div>

              <h3 className="text-xl font-semibold tracking-[-0.02em]">
                {product.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--brand-accent)]">
                {product.tagline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                {product.summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs text-[var(--text-muted)]">
                  {product.scanTime} scan
                </span>
                <span className="rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs text-[var(--text-muted)]">
                  {product.metricCount} metrics
                </span>
                {product.features.slice(0, 2).map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs text-[var(--text-muted)]"
                  >
                    {f.split("—")[0].trim().slice(0, 28)}
                    {f.length > 28 ? "…" : ""}
                  </span>
                ))}
              </div>

              <Link
                href={`/products/${product.slug}`}
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand)] transition-colors hover:text-[var(--brand-accent)]"
              >
                View details <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <CTAPrimary href="/contact">Talk to Sales</CTAPrimary>
        </div>
      </div>
    </div>
  );
}

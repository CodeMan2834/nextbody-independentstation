import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PRODUCTS, PRODUCT_SLUGS, type ProductSlug } from "@/lib/products";

interface Props { params: Promise<{ slug: string }>; }

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS[slug as ProductSlug];
  if (!product) return { title: "Not Found" };
  const canonical = `/products/${product.slug}`;
  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: product.name,
      description: product.summary,
      images: [{ url: product.heroImage, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.summary,
      images: [product.heroImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = PRODUCTS[slug as ProductSlug];
  if (!product) notFound();

  const isF20 = product.slug === "f20-foot-scanner";
  const isOneScan = product.slug === "onescan-gait-analysis";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    category: product.category,
    image: `https://nexbodyfit.com${product.heroImage}`,
    url: `https://nexbodyfit.com/products/${product.slug}`,
    brand: { "@type": "Brand", name: "NEXBODY" },
  };

  return (
    <div className={`product-detail product-detail-${product.accent}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />
      <section className="product-detail-hero">
        <div className={`container-site product-detail-hero-layout${isF20 ? " product-detail-hero-layout-scene" : ""}`}>
          <div className="product-detail-hero-copy">
            <p className="instrument-kicker">{product.category}</p>
            <h1>{product.shortName}</h1>
            {!isOneScan && !isF20 && <p className="product-detail-tagline">{product.tagline}</p>}
            <p>{product.summary}</p>
            <div className="product-detail-actions">
              <Link href="/contact" className="instrument-button instrument-button-primary">Book a demo <ArrowRight aria-hidden="true" /></Link>
            </div>
            <dl>{product.facts.map((fact, index) => <div key={fact}><dt>0{index + 1}</dt><dd>{fact}</dd></div>)}</dl>
          </div>
          <div className="product-detail-hero-media">
            <Image src={product.heroImage} alt={product.name} fill priority sizes={isF20 ? "100vw" : "(min-width: 900px) 58vw, 100vw"} className={isF20 ? "object-cover object-center" : isOneScan ? "object-cover object-right" : "object-cover"} />
          </div>
        </div>
      </section>

      <section className="product-detail-section">
        <div className="container-site product-detail-two-column">
          <header><p className="instrument-kicker">Capabilities</p><h2>What does the system measure and support?</h2></header>
          <ul className="product-rule-list">{product.features.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      {isF20 && (
        <section className="f20-workflow-scene" aria-label="F20 scanning workflow in context">
          <Image src="/media/products/f20/f20-workflow-model.png" alt="Athlete standing on the NEXBODY F20 during a full-foot scan" fill sizes="100vw" />
          <div className="f20-workflow-grade" />
          <div className="container-site f20-workflow-copy"><p className="instrument-kicker">Workflow in context</p><h2>From scan to<br />downstream action.</h2><p>Capture both feet together, review full-foot geometry, then deliver reports or STL models into the next professional workflow.</p></div>
        </section>
      )}

      <section className="product-detail-section product-detail-section-alt">
        <div className="container-site">
          <header className="product-detail-section-header"><p className="instrument-kicker">Specifications</p><h2>Product configuration</h2></header>
          <dl className="product-spec-table">{product.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
        </div>
      </section>

      <section className="product-detail-section">
        <div className="container-site product-detail-two-column">
          <header>
            <p className="instrument-kicker">Outputs & applications</p>
            <h2>Made for professional review.</h2>
            <div className="product-application-tags">{product.industries.map((industry) => <span key={industry}>{industry}</span>)}</div>
          </header>
          <div>
            <ul className="product-rule-list">{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            <div className="product-report-line"><span>Report types</span><p>{product.reports.join(" · ")}</p></div>
          </div>
        </div>
      </section>

      <section className="product-detail-cta">
        <div className="container-site"><p className="instrument-kicker">Next step</p><h2>See {product.shortName} in the right workflow.</h2><p>Book a focused product demonstration with the NEXBODY team.</p><Link href="/contact" className="instrument-button instrument-button-primary">Book a demo <ArrowRight aria-hidden="true" /></Link></div>
      </section>
    </div>
  );
}

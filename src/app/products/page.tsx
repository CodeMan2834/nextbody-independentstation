import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FLAGSHIP_PRODUCT, SUPPORTING_PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description: "NEXBODY X60 for posture, composition and mobility. OneScan for gait and plantar pressure. F20 for 3D scanning of both feet.",
};

export default function ProductsPage() {
  return (
    <div className="product-index page-shell">
      <div className="container-site">
        <header className="product-index-header">
          <p className="instrument-kicker">NEXBODY instruments</p>
          <h1>One assessment family. Clear product boundaries.</h1>
          <p>X60 leads the system. OneScan and F20 add dedicated gait and full-foot morphology workflows where the assessment calls for different hardware.</p>
        </header>

        <article className="flagship-card">
          <div className="flagship-card-copy">
            <p className="instrument-kicker">Flagship · {FLAGSHIP_PRODUCT.category}</p>
            <h2>{FLAGSHIP_PRODUCT.shortName}</h2>
            <p className="product-tagline">{FLAGSHIP_PRODUCT.tagline}</p>
            <p>{FLAGSHIP_PRODUCT.summary}</p>
            <ul>{FLAGSHIP_PRODUCT.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
            <Link href={`/products/${FLAGSHIP_PRODUCT.slug}`}>Explore X60 <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="flagship-card-media">
            <Image src="/media/products/x60/x60-device.png" alt={FLAGSHIP_PRODUCT.name} fill priority sizes="(min-width: 900px) 58vw, 100vw" className="object-cover" />
          </div>
        </article>

        <div className="product-index-supporting">
          {SUPPORTING_PRODUCTS.map((product) => (
            <article key={product.slug}>
              <div className="product-index-media">
                <Image src={product.image} alt={product.name} fill sizes="(min-width: 900px) 50vw, 100vw" className={product.slug === "f20-foot-scanner" ? "object-contain p-10" : "object-cover"} />
              </div>
              <div className="product-index-copy">
                <p className="instrument-kicker">Supporting · {product.category}</p>
                <h2>{product.shortName}</h2>
                <p>{product.summary}</p>
                <div>{product.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
                <Link href={`/products/${product.slug}`}>View product <ArrowRight aria-hidden="true" /></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

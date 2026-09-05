/**
 * Product & use-case content.
 * Content managed via Decap CMS → content/products.json & content/cases.json.
 */

import productsData from "../../content/products.json";
import casesData from "../../content/cases.json";

export type ProductSlug =
  | "nexbody-x60"
  | "onescan-gait-analysis"
  | "f20-foot-scanner";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductDownload {
  label: string;
  href: string;
}

export interface ProductDefinition {
  slug: ProductSlug;
  name: string;
  shortName: string;
  category: string;
  priority: "flagship" | "supporting";
  tagline: string;
  summary: string;
  image: string;
  heroImage: string;
  accent: "blue" | "gold" | "cyan";
  facts: string[];
  features: string[];
  specs: ProductSpec[];
  highlights: string[];
  reports: string[];
  industries: string[];
  downloads: ProductDownload[];
}

function buildProducts(): Record<ProductSlug, ProductDefinition> {
  return Object.fromEntries(
    productsData.products.map((product) => [product.slug, product])
  ) as unknown as Record<ProductSlug, ProductDefinition>;
}

export const PRODUCTS = buildProducts();
export const PRODUCT_SLUGS = productsData.products.map(
  (product) => product.slug
) as ProductSlug[];
export const PRODUCT_LIST = PRODUCT_SLUGS.map((slug) => PRODUCTS[slug]);
export const FLAGSHIP_PRODUCT = PRODUCTS["nexbody-x60"];
export const SUPPORTING_PRODUCTS = PRODUCT_LIST.filter(
  (product) => product.priority === "supporting"
);

export interface UseCase {
  id: string;
  name: string;
  context: string;
  industry: string;
  product: string;
  headline: string;
  need: string;
  approach: string;
  result: string;
  media: {
    src: string;
    alt: string;
  };
}

export const USE_CASES: UseCase[] = casesData.cases as UseCase[];

export const INDUSTRY_SOLUTIONS = [
  {
    id: "rehab",
    title: "For Rehabilitation",
    body: "Capture posture landmarks, composition baselines and neck-shoulder mobility so therapists can review change visit to visit — without borrowing claims from gait or foot-scan systems.",
  },
  {
    id: "fitness",
    title: "For Fitness & Wellness",
    body: "Turn posture scores and segmental composition into a structured member review. Reports can be printed, emailed or branded for the facility.",
  },
  {
    id: "sports",
    title: "For Sports Performance",
    body: "Use OneScan plantar-pressure and gait metrics when the brief is movement quality — keep X60 focused on posture, composition and mobility.",
  },
  {
    id: "clinical",
    title: "For Clinics",
    body: "Guided assessment positions, configurable thresholds and interface upload support professional workflows. Results support review; they are not a medical diagnosis.",
  },
  {
    id: "footwear",
    title: "For Footwear & Orthotics",
    body: "F20 captures both feet in 3D with 30+ measurements, arch classification and STL output for custom insoles and C2M footwear programs.",
  },
] as const;

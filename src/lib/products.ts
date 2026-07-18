/**
 * Product & case study content.
 * Content managed via Decap CMS → content/products.json & content/cases.json.
 * Update those JSON files with verified specs and assets when ready.
 * Structure references industry-standard 3D body scanner positioning (Visbody-class).
 */

import productsData from "../../content/products.json";
import casesData from "../../content/cases.json";

export type ProductSlug = "nextbody-s30" | "nextbody-s20";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductDefinition {
  slug: ProductSlug;
  name: string;
  tagline: string;
  summary: string;
  image: string;
  heroImagePending: boolean;
  scanTime: string;
  metricCount: string;
  features: string[];
  specs: ProductSpec[];
  highlights: string[];
  reports: string[];
  industries: string[];
}

/** Build typed record from CMS-editable JSON array */
function buildProducts(): Record<ProductSlug, ProductDefinition> {
  const record: Record<string, ProductDefinition> = {};
  for (const p of productsData.products) {
    record[p.slug] = p as ProductDefinition;
  }
  return record as Record<ProductSlug, ProductDefinition>;
}

export const PRODUCTS = buildProducts();
export const PRODUCT_SLUGS = Object.keys(PRODUCTS) as ProductSlug[];

export interface CustomerCase {
  id: string;
  name: string;
  region: string;
  industry: string;
  product: "S30" | "S20";
  headline: string;
  challenge: string;
  solution: string;
  outcome: string;
  placeholder: boolean;
  media: {
    src: string;
    alt: string;
  };
}

export const CUSTOMER_CASES: CustomerCase[] = casesData.cases as CustomerCase[];

export const INDUSTRY_SOLUTIONS = [
  {
    id: "fitness",
    title: "For Fitness",
    body: "Set measurable goals with body composition, 3D shape change, and posture screening — turn every renewal into a data-backed conversation.",
  },
  {
    id: "rehab",
    title: "For Physiotherapy",
    body: "Baseline and track segmental muscle, posture alignment, and shoulder function to personalize rehab and prove outcomes.",
  },
  {
    id: "nutrition",
    title: "For Nutrition",
    body: "Pair BMR, visceral fat, and hydration metrics with meal plans — clients see progress beyond the scale.",
  },
  {
    id: "sports",
    title: "For Sports",
    body: "Monitor lean mass and segmental balance across training blocks to reduce injury risk and optimize performance.",
  },
  {
    id: "aesthetic",
    title: "For Aesthetic & Spa",
    body: "Quantify body shape and composition to design treatment packages members can see changing in 3D.",
  },
] as const;

export const POSTURE_METRICS = [
  "Forward head posture",
  "Rounded shoulders",
  "Anterior pelvic tilt",
  "Hyperextended knees",
  "Leg alignment (X/O/K detection)",
  "Shoulder function range",
] as const;

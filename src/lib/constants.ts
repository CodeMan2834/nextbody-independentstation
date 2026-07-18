/**
 * Site constants — static configuration + CMS-editable homepage content.
 * Editable via Decap CMS → content/homepage-*.json files.
 */

import narrativeData from "../../content/homepage-narrative.json";
import chaptersData from "../../content/homepage-chapters.json";
import trustData from "../../content/homepage-trust.json";

export const SITE = {
  name: "NextBody",
  title: "NextBody — See Your Body in a New Dimension",
  description:
    "NextBody brings spatial-grade body intelligence to premium gyms — from scan to digital twin, seamlessly. Medical-grade 3D body scanners for B2B fitness operators in MENA and Southeast Asia.",
  url: "https://nextbody.fit",
  ogImage: "/images/og-image.svg",
  locale: "en",
} as const;

export const NAV_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
] as const;

export const HOME_SECTION_LINKS = [
  { label: "Overview", href: "/#narrative" },
  { label: "Product", href: "/#closer-look" },
  { label: "Cases", href: "/#cases" },
  { label: "Technology", href: "/#technology" },
] as const;

export const PRODUCT_MODELS = [
  {
    id: "s30",
    label: "S30",
    slug: "nextbody-s30" as const,
    image: "/images/f20-product.webp",
    tagline: "Flagship 3D scanner — 50+ metrics in 32s",
  },
  {
    id: "s20",
    label: "S20",
    slug: "nextbody-s20" as const,
    image: "/images/f20-product.webp",
    tagline: "Compact analyzer for boutique studios",
  },
] as const;

export const PRODUCT_DETAIL_STEPS = [
  {
    id: "intro",
    title: "Hybrid 3D + BIA technology.",
    description:
      "Combines structured-light 3D scanning with multi-frequency bioimpedance — 50+ data types across 6 categories for precise body assessment.",
    annotation: null as null | { x: string; y: string; label: string },
  },
  {
    id: "depth",
    title: "Instant 3D body scan",
    description:
      "Generates a millimeter-level 3D avatar in 32 seconds — 18 circumference and posture parameters members can understand at a glance.",
    annotation: { x: "58%", y: "32%", label: "Depth vision sensor" },
  },
  {
    id: "bia",
    title: "8-electrode, 4-frequency BIA",
    description:
      "Segmental fat, muscle, and fluid analysis with clinical-grade repeatability — BMI, visceral fat, BMR, and WHR in one flow.",
    annotation: { x: "42%", y: "52%", label: "Segment electrodes" },
  },
  {
    id: "scan",
    title: "Reports that drive retention",
    description:
      "Body composition, posture, circumference, and shoulder function reports — Before & After avatars and cloud history for every member.",
    annotation: { x: "50%", y: "68%", label: "Assessment zone" },
  },
] as const;

// ═══ CMS-editable: content/homepage-narrative.json ═══
export const NARRATIVE_BEATS: readonly string[] = narrativeData.narrativeBeats;
export const METRICS: readonly { label: string; value: number; suffix: string }[] =
  narrativeData.metrics;

export const GLASS_CARDS = [
  {
    label: "Body Fat",
    value: "18.2%",
    hint: "DEXA-correlated · segment analysis",
    color: "var(--brand-accent)",
  },
  {
    label: "Skeletal Muscle",
    value: "42.1 kg",
    hint: "Left/right balance · trend tracking",
    color: "var(--brand-green)",
  },
  {
    label: "Posture Score",
    value: "A+",
    hint: "Forward head · pelvic tilt mapping",
    color: "var(--brand-purple)",
  },
  {
    label: "Visceral Fat",
    value: "Level 4",
    hint: "Health risk band · coach alerts",
    color: "var(--brand-gold)",
  },
  {
    label: "Scan Complete",
    value: "32s",
    hint: "Full report ready for member retention",
    color: "var(--brand)",
  },
] as const;

// ═══ CMS-editable: content/homepage-chapters.json ═══
export const WHY_CHAPTERS = chaptersData.chapters as typeof chaptersData.chapters;

export const TECHNOLOGY_PIPELINE = [
  {
    step: "01",
    title: "Capture",
    body: "Structured-light 3D scan + 8-electrode BIA in one 32-second session.",
  },
  {
    step: "02",
    title: "Reconstruct",
    body: "Mesh alignment, posture mapping, and segment-level composition analysis.",
  },
  {
    step: "03",
    title: "Deliver",
    body: "Coach dashboards, member reports, and retention-ready trend tracking.",
  },
] as const;

// ═══ CMS-editable: content/homepage-trust.json ═══
export const TRUST_VALUES = trustData.trustValues as typeof trustData.trustValues;

/** @deprecated Use WHY_CHAPTERS */
export const WHY_NEXTBODY = WHY_CHAPTERS.map((ch) => ({
  title: ch.eyebrow,
  description: ch.title,
}));

export const TRUST_BAR_LOGOS = TRUST_VALUES.map((v) => ({
  name: v.title,
  icon: v.icon,
}));

export const FORM_FIELDS = [
  { name: "fullName", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Work Email", type: "email", required: true },
  { name: "company", label: "Company / Gym Name", type: "text", required: true },
  {
    name: "country",
    label: "Country",
    type: "select",
    required: true,
    options: [
      "United Arab Emirates",
      "Saudi Arabia",
      "Qatar",
      "Kuwait",
      "Oman",
      "Bahrain",
      "Thailand",
      "Indonesia",
      "Malaysia",
      "Vietnam",
      "Philippines",
      "Other",
    ],
  },
  {
    name: "productInterest",
    label: "Product Interest",
    type: "select",
    required: false,
    options: ["S30", "S20", "Multiple / Not Sure"],
  },
  { name: "message", label: "Message", type: "textarea", required: false },
] as const;

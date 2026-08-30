import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { PRODUCT_SLUGS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;

  const pages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/products", priority: 0.9, changeFrequency: "weekly" as const },
    ...PRODUCT_SLUGS.map((slug) => ({
      path: `/products/${slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

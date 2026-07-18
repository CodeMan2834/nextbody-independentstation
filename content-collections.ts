import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const products = defineCollection({
  name: "products",
  directory: "src/content/products",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    tagline: z.string(),
    order: z.number().default(0),
    specs: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    ),
    highlights: z.array(z.string()),
    image: z.string(),
    deviceSvg: z.string(),
    cta: z.string(),
  }),
});

const siteSettings = defineCollection({
  name: "siteSettings",
  directory: "src/content",
  include: "site-settings.mdx",
  schema: z.object({
    siteName: z.string(),
    tagline: z.string(),
    contactEmail: z.string(),
    whatsappNumber: z.string(),
    nav: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    ),
    socialLinks: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
        icon: z.string(),
      })
    ),
  }),
});

export default defineConfig({
  collections: [products, siteSettings],
});

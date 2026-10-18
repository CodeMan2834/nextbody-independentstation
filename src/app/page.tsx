import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { HomeExperience } from "@/components/home/HomeExperience";

export const metadata: Metadata = {
  title: { absolute: siteConfig.seo?.title?.trim() || "3D Body Assessment, Gait Analysis & Foot Scanners | NEXBODY" },
  description: siteConfig.seo?.description?.trim() || siteConfig.tagline,
  alternates: { canonical: "/" },
  openGraph: { title: siteConfig.seo?.title?.trim(), description: siteConfig.seo?.description?.trim(), url: "/", type: "website", siteName: "NEXBODY", images: [{ url: "/media/products/x60/x60-cover.png", alt: "NEXBODY body assessment systems" }] },
};

export default function HomePage() {
  return <HomeExperience />;
}

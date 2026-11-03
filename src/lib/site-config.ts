/**
 * Site-wide commercial / contact settings.
 * Content managed via Decap CMS → content/site-settings.json.
 *
 */

import siteSettings from "../../content/site-settings.json";

export interface SiteNavItem {
  label: string;
  href: string;
}

export interface SiteSocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  seo?: { title?: string; description?: string };
  contactEmail: string;
  nav: SiteNavItem[];
  headerCta: SiteNavItem;
  socialLinks: SiteSocialLink[];
}


export const siteConfig: SiteConfig = {
  siteName: siteSettings.siteName,
  tagline: siteSettings.tagline,
  seo: siteSettings.seo,
  contactEmail: siteSettings.contactEmail,
  nav: siteSettings.nav as SiteNavItem[],
  headerCta: siteSettings.headerCta,
  socialLinks: (siteSettings.socialLinks || []) as SiteSocialLink[],
};

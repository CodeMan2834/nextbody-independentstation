/**
 * Site-wide commercial / contact settings.
 * Content managed via Decap CMS → content/site-settings.json.
 *
 * Override WhatsApp via env without changing CMS content:
 *   NEXT_PUBLIC_WHATSAPP_NUMBER=+9715xxxxxxxx
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
  contactEmail: string;
  /** E.164 preferred, e.g. +971501234567 */
  whatsappNumber: string;
  nav: SiteNavItem[];
  socialLinks: SiteSocialLink[];
}

const DEFAULT_WHATSAPP = "+971000000000";

export const siteConfig: SiteConfig = {
  siteName: siteSettings.siteName,
  tagline: siteSettings.tagline,
  contactEmail: siteSettings.contactEmail,
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    siteSettings.whatsappNumber ||
    DEFAULT_WHATSAPP,
  nav: siteSettings.nav as SiteNavItem[],
  socialLinks: siteSettings.socialLinks as SiteSocialLink[],
};

/** Digits only — required by wa.me */
export function whatsappDigits(number = siteConfig.whatsappNumber): string {
  return number.replace(/\D/g, "");
}

export function isWhatsAppPlaceholder(
  number = siteConfig.whatsappNumber
): boolean {
  const digits = whatsappDigits(number);
  return !digits || digits === "971000000000" || /^0+$/.test(digits);
}

export function whatsappHref(
  message?: string,
  number = siteConfig.whatsappNumber
): string {
  const digits = whatsappDigits(number);
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_MESSAGES = {
  float: "Hi, I'm interested in NEXBODY Nexbody-X60",
  afterInquiry: "Hi, I just submitted an inquiry about NEXBODY",
} as const;

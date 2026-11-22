import type { CSSProperties } from "react";
import settings from "../../content/site-settings.json";

export const FONT_FAMILIES: Record<string, string> = {
  merriweather: 'var(--font-nexbody-serif), Georgia, "Times New Roman", serif',
  system: '"Segoe UI", Arial, Helvetica, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
};

export function appearanceVariables(): CSSProperties {
  const type = settings.typography;
  const variables: Record<string, string> = {
    "--site-heading-font": FONT_FAMILIES[type.headingFont] || FONT_FAMILIES.merriweather,
    "--site-body-font": FONT_FAMILIES[type.bodyFont] || FONT_FAMILIES.system,
    "--site-button-font": FONT_FAMILIES[type.buttonFont] || FONT_FAMILIES.system,
  };
  for (const [key, value] of Object.entries(type)) {
    if (typeof value === "number" && Number.isFinite(value)) variables[`--site-${key}`] = `${value}px`;
  }
  for (const [moduleName, scales] of Object.entries(type.modules || {})) {
    for (const [role, value] of Object.entries(scales as Record<string, number>)) {
      if (["headingScale", "bodyScale", "detailScale"].includes(role) && Number.isFinite(value)) {
        const roleName = role.replace("Scale", "").replace("heading", "heading").replace("body", "body").replace("detail", "detail");
        variables[`--type-${moduleName}-${roleName}`] = String(value / 100);
      }
    }
  }
  variables["--site-logo-desktop"] = `${settings.branding.desktopHeight}px`;
  variables["--site-logo-mobile"] = `${settings.branding.mobileHeight}px`;
  variables["--site-logo-footer"] = `${settings.branding.footerHeight}px`;
  return variables as CSSProperties;
}

export function brandLogo(): string {
  return settings.branding.mode === "custom" && settings.branding.logo
    ? settings.branding.logo
    : "/brand/nexbody-logo-white.png";
}

import settings from "../../../content/site-settings.json";
import { brandLogo } from "@/lib/appearance";

export function BrandLogo({ footer = false }: { footer?: boolean }) {
  // A regular image keeps the original aspect ratio for CMS-uploaded logos.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={brandLogo()} alt={settings.siteName} className={`site-brand-logo${footer ? " site-brand-logo-footer" : ""}`} width="1600" height="272" />;
}

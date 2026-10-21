import { siteConfig } from "./site-config";
import products from "../../content/products.json";
import { SOLUTIONS } from "./editorial";

export interface NavigationItem { label: string; href: string; description?: string; children?: NavigationItem[]; }
const productOrder = ["nexbody-x60", "f20-foot-scanner", "onescan-gait-analysis"];
const descriptions: Record<string, string> = {
  "nexbody-x60": "Body Composition Scanner",
  "f20-foot-scanner": "3D Full-Foot Scanning",
  "onescan-gait-analysis": "Precision Gait Analysis",
};
export const PRODUCT_NAV_LINKS = [...products.products].sort((a,b) => productOrder.indexOf(a.slug) - productOrder.indexOf(b.slug)).map((product) => ({
  label: product.menuLabel || product.shortName.replace(/^Nexbody[- ]/i, "Nexbody "),
  description: product.menuDescription || descriptions[product.slug],
  href: `/products/${product.slug}`,
}));
export const SOLUTION_NAV_LINKS = SOLUTIONS.map((solution) => ({ label: solution.title, description: "", href: `/solutions/${solution.slug}` }));
export const PRIMARY_NAV_LINKS: NavigationItem[] = siteConfig.nav.map(link => ({...link, children: link.href === "/products" ? PRODUCT_NAV_LINKS : link.href === "/solutions" ? SOLUTION_NAV_LINKS : undefined}));

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAPrimary } from "@/components/shared/CTAPrimary";
import { HeaderNavLink } from "./HeaderNavLink";
import { MobileNav } from "./MobileNav";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { HOME_SECTION_LINKS, NAV_LINKS } from "@/lib/constants";

const iconButtonClass =
  "flex size-10 shrink-0 items-center justify-center rounded-sm border border-white/[0.12] bg-white/[0.03] text-[var(--text-primary)] transition-[transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[var(--brand-accent)]/35 hover:bg-white/[0.08] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useHeaderScroll();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const centerLinks = isHome
    ? [...HOME_SECTION_LINKS, ...NAV_LINKS]
    : NAV_LINKS;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[var(--header-height)] border-b transition-[background-color,border-color,backdrop-filter,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "border-[var(--surface-border)] bg-[rgba(5,7,11,0.94)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-transparent bg-[rgba(5,7,11,0.62)] backdrop-blur-md"
        )}
      >
        <div className="container-site grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[auto_1fr_auto] lg:gap-6">
          <Link
            href="/"
            aria-label={isHome ? "NEXBODY home" : "Return to NEXBODY home"}
            className="group shrink-0 text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:opacity-90"
          >
            <span className="text-white transition-colors duration-300 group-hover:text-[var(--brand-accent)]">
              NEXBODY
            </span>
          </Link>

          <nav
            className="hidden items-center justify-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {centerLinks.map((link) => (
              <HeaderNavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <CTAPrimary
              href="/contact"
              size="sm"
              className="hidden sm:inline-flex"
              icon={false}
            >
              Book a Demo
            </CTAPrimary>

            <button
              type="button"
              className={cn(iconButtonClass, "group lg:hidden")}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-[18px] transition-transform duration-300 group-hover:scale-105" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={centerLinks}
      />
    </>
  );
}

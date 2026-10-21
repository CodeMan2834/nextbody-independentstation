"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAPrimary } from "@/components/shared/CTAPrimary";

import type { NavigationItem } from "@/lib/navigation";

type NavItem = NavigationItem;

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: readonly NavItem[];
}

const iconButtonClass =
  "flex size-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--brand-accent)]/30 hover:bg-white/[0.08] hover:shadow-[0_6px_24px_rgba(0,229,255,0.1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40";

export function MobileNav({ open, onClose, links }: MobileNavProps) {
  const pathname = usePathname();
  const [expandedHref, setExpandedHref] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') || []);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const items = focusable(), first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 1024) onClose(); };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); previous?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={panelRef} className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 right-0 flex w-[min(100vw-3rem,320px)] flex-col overflow-y-auto border-l border-[var(--surface-border)] bg-[rgba(8,10,18,0.96)] p-6 shadow-[-16px_0_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className={iconButtonClass}
            aria-label="Close menu"
          >
            <X className="size-[18px]" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
          {links.map((link) => {
            const children = link.children || [];
            const expanded = expandedHref === link.href;
            const listId = `mobile-${link.href.slice(1)}-links`;
            const isActive =
              !link.href.startsWith("#") &&
              (pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(`${link.href}/`)));

            return (
              <div key={link.href}>
              <div className="flex items-center">
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block flex-1 rounded-xl px-4 py-3.5 text-[15px] font-medium tracking-[-0.01em]",
                  "text-[var(--text-muted)] transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:bg-white/[0.06] hover:text-[var(--text-primary)] hover:translate-x-0.5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40",
                  isActive && "border border-white/[0.08] bg-white/[0.05] text-[var(--text-primary)]"
                )}
              >
                {link.label}
              </Link>
              {children.length > 0 && (
                <button type="button" className={iconButtonClass} aria-label={`Toggle ${link.label} list`} aria-expanded={expanded} aria-controls={listId} onClick={() => setExpandedHref(expanded ? null : link.href)}>
                  <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
                </button>
              )}
              </div>
              {children.length > 0 && expanded && (
                <ul id={listId} className="my-2 ml-4 space-y-1 border-l border-white/15 pl-3">
                  {children.map((product) => (
                    <li key={product.href}><Link href={product.href} onClick={onClose} aria-current={pathname === product.href ? "page" : undefined} className={cn("block rounded-lg px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--brand-accent)]", pathname === product.href && "bg-white/5 text-[var(--brand-accent)]")}>
                      <span className="block">{product.label}</span>
                      {product.description && <span className="mt-1 block text-xs text-[var(--text-dim)]">{product.description}</span>}
                    </Link></li>
                  ))}
                </ul>
              )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-8">
          <CTAPrimary href={siteConfig.headerCta.href} onClick={onClose} className="w-full justify-center" icon={false}>
            {siteConfig.headerCta.label}
          </CTAPrimary>
        </div>
      </div>
    </div>
  );
}

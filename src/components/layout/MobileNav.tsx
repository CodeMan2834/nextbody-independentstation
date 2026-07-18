"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAPrimary } from "@/components/shared/CTAPrimary";

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: readonly NavItem[];
}

const iconButtonClass =
  "flex size-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--brand-accent)]/30 hover:bg-white/[0.08] hover:shadow-[0_6px_24px_rgba(0,229,255,0.1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40";

export function MobileNav({ open, onClose, links }: MobileNavProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 right-0 flex w-[min(100vw-3rem,320px)] flex-col border-l border-[var(--surface-border)] bg-[rgba(8,10,18,0.96)] p-6 shadow-[-16px_0_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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
            const isActive =
              !link.href.startsWith("#") &&
              (pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(`${link.href}/`)));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "rounded-xl px-4 py-3.5 text-[15px] font-medium tracking-[-0.01em]",
                  "text-[var(--text-muted)] transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:bg-white/[0.06] hover:text-[var(--text-primary)] hover:translate-x-0.5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40",
                  isActive && "border border-white/[0.08] bg-white/[0.05] text-[var(--text-primary)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-8">
          <CTAPrimary href="/contact" className="w-full justify-center" icon={false}>
            Book a Demo
          </CTAPrimary>
        </div>
      </div>
    </div>
  );
}

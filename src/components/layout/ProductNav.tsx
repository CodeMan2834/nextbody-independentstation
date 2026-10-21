"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { NavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { HeaderNavLink } from "./HeaderNavLink";

export function ProductNav({ href, label, items = [] }: { href: string; label: string; items?: NavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const openedByHover = useRef(false);
  const pathname = usePathname();
  const children = items;
  const listId = `desktop-${href.slice(1)}-links`;
  // A route change also closes a menu opened before client navigation.
  const [openedPath, setOpenedPath] = useState(pathname);
  const expanded = open && openedPath === pathname;

  useEffect(() => {
    if (!expanded) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [expanded]);

  if (!children.length) return <HeaderNavLink href={href} label={label} />;

  return (
    <div ref={container} className="relative" onPointerEnter={(event) => {
      if (event.pointerType === "mouse") { openedByHover.current = true; setOpenedPath(pathname); setOpen(true); }
    }} onPointerLeave={(event) => {
      if (event.pointerType === "mouse") { openedByHover.current = false; setOpen(false); }
    }} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) { event.preventDefault(); setOpen(false); toggle.current?.focus(); }
    }}>
      <div className="flex items-center">
        <HeaderNavLink href={href} label={label} />
        <button ref={toggle} type="button" aria-label={`Toggle ${label} list`} aria-expanded={expanded} aria-controls={listId} onClick={(event) => {
          setOpenedPath(pathname);
          setOpen(event.detail > 0 && openedByHover.current ? true : !expanded);
          openedByHover.current = false;
        }} className="mr-1 flex size-8 items-center justify-center rounded-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--brand-accent)]">
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
      <div hidden={!expanded} className="absolute left-0 top-full w-80 max-w-[calc(100vw-2rem)] pt-3">
          <ul id={listId} className="rounded-lg border border-white/15 bg-[#080b12] p-2 shadow-xl">
            {children.map((product) => (
              <li key={product.href}><Link href={product.href} onClick={() => setOpen(false)} aria-current={pathname === product.href ? "page" : undefined} className={cn("block rounded-md px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--brand-accent)]", pathname === product.href && "bg-white/5 text-[var(--brand-accent)]")}>
                <span className="block font-medium">{product.label}</span>
                {product.description && <span className="mt-1 block text-xs text-[var(--text-dim)]">{product.description}</span>}
              </Link></li>
            ))}
          </ul>
        </div>
    </div>
  );
}

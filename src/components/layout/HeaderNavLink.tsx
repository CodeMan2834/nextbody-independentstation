"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderNavLinkProps {
  href: string;
  label: string;
}

export function HeaderNavLink({ href, label }: HeaderNavLinkProps) {
  const pathname = usePathname();
  const isHashLink = href.startsWith("#");
  const isActive =
    !isHashLink &&
    (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

  return (
    <Link
      href={href}
      className={cn(
        "group relative rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap",
        "text-[var(--text-muted)] transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:bg-white/[0.06] hover:text-[var(--text-primary)] hover:-translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "after:pointer-events-none after:absolute after:bottom-1.5 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2",
        "after:bg-gradient-to-r after:from-transparent after:via-[var(--brand-accent)] after:to-transparent",
        "after:transition-[width,opacity] after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:after:w-[calc(100%-1.25rem)] hover:after:opacity-100",
        isActive &&
          "bg-white/[0.05] text-[var(--text-primary)] after:w-[calc(100%-1.25rem)] after:opacity-80"
      )}
    >
      {label}
    </Link>
  );
}

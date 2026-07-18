"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CTASecondaryProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
  size?: "default" | "sm";
}

export function CTASecondary({
  href,
  children,
  className,
  icon = false,
  size = "default",
}: CTASecondaryProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium",
        "border border-white/[0.12] bg-white/[0.03] text-[var(--text-primary)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        "backdrop-blur-sm",
        "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-[var(--brand-accent)]/35 hover:bg-white/[0.07]",
        "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_28px_rgba(0,229,255,0.08)]",
        "active:translate-y-0 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-[var(--brand-accent)]/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        size === "sm" ? "px-5 py-2.5 text-[13px]" : "px-7 py-3.5 text-sm",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      {icon && (
        <ChevronDown className="relative z-10 size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0.5" />
      )}
    </Link>
  );
}

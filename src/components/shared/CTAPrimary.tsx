"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CTAPrimaryProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
  size?: "default" | "sm";
}

export function CTAPrimary({
  href,
  children,
  className,
  icon = true,
  size = "default",
}: CTAPrimaryProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm border border-[var(--brand)] font-semibold",
        "bg-[var(--brand)]",
        "text-white",
        "shadow-[0_12px_34px_rgba(43,111,255,0.22)]",
        "transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-[var(--brand-accent)] hover:shadow-[0_16px_38px_rgba(43,111,255,0.32)] hover:brightness-110",
        "active:translate-y-0 active:scale-[0.98] active:brightness-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/15 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        size === "sm" ? "px-5 py-2.5 text-[13px]" : "px-7 py-3.5 text-sm",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      {icon && (
        <ArrowRight className="relative z-10 size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

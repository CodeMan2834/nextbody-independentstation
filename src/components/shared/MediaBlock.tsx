"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AspectRatio = "16/10" | "16/9" | "4/3" | "3/4" | "1/1" | "auto";
type OverlayLevel = "none" | "subtle" | "medium" | "heavy";
type FitMode = "cover" | "contain";
type RoundedSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl";

const aspectMap: Record<AspectRatio, string> = {
  "16/10": "aspect-[16/10]",
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  auto: "",
};

const roundedMap: Record<RoundedSize, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const overlayGradient: Record<Exclude<OverlayLevel, "none">, string> = {
  subtle:
    "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 50%, rgba(0,0,0,0.35) 100%)",
  medium:
    "radial-gradient(ellipse 85% 65% at 50% 40%, transparent 40%, rgba(0,0,0,0.5) 100%)",
  heavy:
    "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 25%, rgba(0,0,0,0.65) 100%)",
};

interface MediaBlockProps {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  /** Aspect ratio of the media container. Default "16/10" */
  aspect?: AspectRatio;
  /** Dark-theme vignette overlay. Default "medium" */
  overlay?: OverlayLevel;
  /** Image fit mode. SVG always uses contain. Default "cover" */
  fit?: FitMode;
  /** Border radius size. Default "2xl" */
  rounded?: RoundedSize;
  /** Inner padding around image. Default "md" (p-8 md:p-12) */
  padding?: "none" | "sm" | "md";
  /** Image width for Next.js optimization */
  imgWidth?: number;
  /** Image height for Next.js optimization */
  imgHeight?: number;
}

const paddingMap = {
  none: "",
  sm: "p-4 md:p-6",
  md: "p-8 md:p-12",
};

export function MediaBlock({
  src,
  fallback = "/svg/report-dashboard.svg",
  alt,
  className,
  priority = false,
  pending = false,
  pendingLabel = "Visual asset pending",
  aspect = "16/10",
  overlay = "medium",
  fit = "cover",
  rounded = "2xl",
  padding = "md",
  imgWidth = 640,
  imgHeight = 400,
}: MediaBlockProps) {
  const [useFallback, setUseFallback] = useState(false);

  if (pending) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          aspectMap[aspect] || "aspect-[16/10]",
          roundedMap[rounded],
          "border border-dashed border-[var(--surface-border)] bg-[rgba(255,255,255,0.02)]",
          className
        )}
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(0,102,255,0.04),transparent_70%)]" />
        <span className="relative text-xs tracking-[0.06em] text-[var(--text-dim)]">
          {pendingLabel}
        </span>
      </div>
    );
  }

  const activeSrc = useFallback ? fallback : src;
  const isSvg = activeSrc.endsWith(".svg");
  const hasOverlay = overlay !== "none";
  const fitClass = isSvg ? "object-contain" : fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        roundedMap[rounded],
        "border border-[var(--surface-border)]",
        "bg-[rgba(4,8,20,0.6)] shadow-[0_24px_80px_rgba(0,102,255,0.12)]",
        className
      )}
    >
      {/* Blue edge glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(0,102,255,0.08),transparent_70%)]" />
      {/* Dark vignette */}
      {hasOverlay && (
        <div
          className="absolute inset-0 z-[2]"
          style={{ background: overlayGradient[overlay] }}
        />
      )}
      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 z-[2] h-1/3 bg-gradient-to-t from-[rgba(4,8,20,0.9)] to-transparent" />

      <div
        className={cn(
          "relative flex items-center justify-center",
          aspectMap[aspect] || "aspect-[16/10]",
          paddingMap[padding]
        )}
      >
        <Image
          src={activeSrc}
          alt={alt}
          width={imgWidth}
          height={imgHeight}
          priority={priority}
          className={cn(
            "max-h-full w-auto max-w-full",
            fitClass,
            isSvg
              ? "drop-shadow-[0_20px_60px_rgba(0,102,255,0.35)]"
              : "brightness-[0.85] contrast-[1.08] saturate-[0.9]",
            !isSvg && fit === "cover" && "rounded-lg"
          )}
          onError={() => setUseFallback(true)}
        />
      </div>
    </div>
  );
}

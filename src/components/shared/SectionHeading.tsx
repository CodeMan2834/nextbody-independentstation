import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  align = "center",
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "relative z-10",
        align === "center" ? "text-center" : "text-start",
        className
      )}
    >
      {eyebrow && (
        <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-accent)]">
          {eyebrow}
        </span>
      )}
      <Heading
        className={cn(
          "text-balance text-[clamp(28px,5vw,48px)] font-semibold leading-[1.08] tracking-[-0.03em]",
          !subtitle && "mb-0"
        )}
      >
        {title}
      </Heading>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-[520px] text-balance text-[15px] leading-relaxed text-[var(--text-muted)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

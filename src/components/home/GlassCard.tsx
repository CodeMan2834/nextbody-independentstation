interface GlassCardProps {
  label: string;
  value: string;
  hint: string;
  color: string;
  className?: string;
}

export function GlassCard({ label, value, hint, color, className }: GlassCardProps) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 w-[min(380px,78vw)] -translate-x-1/2 -translate-y-1/2 rounded-[24px] p-7 glass ${className || ""}`}
      style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}
    >
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </span>
      <span
        className="mb-2 block text-[clamp(32px,6vw,44px)] font-bold tracking-[-0.02em]"
        style={{ color }}
      >
        {value}
      </span>
      <p className="text-[14px] leading-relaxed text-[#8890a8]">{hint}</p>
    </div>
  );
}

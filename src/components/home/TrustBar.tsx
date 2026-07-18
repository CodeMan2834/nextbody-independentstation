import { Microscope, Shield, Award, Lock } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TRUST_VALUES } from "@/lib/constants";

const ICONS = {
  Lock,
  Microscope,
  Award,
  Shield,
} as const;

export function TrustBar() {
  return (
    <section
      id="trust"
      className="relative z-10 border-t border-[var(--surface-border)] bg-[var(--card)] py-24 md:py-32"
      aria-label="Trust and values"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow="Designed for operators"
          title="Built with the standards premium gyms expect."
          subtitle="Clinical rigor, member privacy, and deployment support — so your team can focus on retention, not infrastructure."
          className="mb-16"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {TRUST_VALUES.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--surface-border)] bg-[rgba(255,255,255,0.02)] p-6 md:p-8"
              >
                <Icon className="mb-4 size-6 text-[var(--brand-accent)]/70" />
                <h3 className="text-lg font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

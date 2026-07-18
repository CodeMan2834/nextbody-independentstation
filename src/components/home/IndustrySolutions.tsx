import { SectionHeading } from "@/components/shared/SectionHeading";
import { INDUSTRY_SOLUTIONS } from "@/lib/products";

export function IndustrySolutions() {
  return (
    <section
      className="relative z-10 border-y border-[var(--surface-border)] bg-black py-20 md:py-24"
      aria-label="Industry solutions"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow="Solutions"
          title="Built for how you operate."
          subtitle="Industry-specific value props — refine copy when vertical marketing assets are ready."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRY_SOLUTIONS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[var(--surface-border)] bg-white/[0.02] p-6"
            >
              <h3 className="text-base font-semibold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAPrimary } from "@/components/shared/CTAPrimary";
import { CTASecondary } from "@/components/shared/CTASecondary";

export function FinalCTA() {
  return (
    <section className="relative z-10 bg-[var(--background)] py-28 text-center">
      <SectionHeading
        title="Ready to bring spatial-grade analytics to your gym?"
        subtitle="Book a personalized demo. See the scanner in action."
      />
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 px-6">
        <CTAPrimary href="/contact">Book a Demo</CTAPrimary>
        <CTASecondary href="/products">Explore Products</CTASecondary>
      </div>
    </section>
  );
}

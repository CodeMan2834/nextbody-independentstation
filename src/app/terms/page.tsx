import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "NEXBODY terms of service.",
};

export default function TermsPage() {
  return (
    <div className="relative z-10 page-shell">
      <div className="container-site">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.03em]">
            Terms of Service
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--text-muted)]">
            <p>Last updated: {new Date().getFullYear()}</p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the NEXBODY website, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Use License</h2>
            <p>
              This website and its content are for informational purposes. You may not modify, reproduce, or distribute the content without prior written consent from NEXBODY.
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Disclaimer</h2>
            <p>
              The materials on this website are provided on an &apos;as is&apos; basis. NEXBODY makes no warranties regarding the accuracy or reliability of the information. Assessment reports support professional review and are not a substitute for medical diagnosis.
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Contact</h2>
            <p>
              For questions about these Terms, contact info@nexbody.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

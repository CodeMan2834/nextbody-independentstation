import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NEXBODY privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="relative z-10 page-shell">
      <div className="container-site">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.03em]">
            Privacy Policy
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--text-muted)]">
            <p>
              NEXBODY is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Information We Collect</h2>
            <p>
              We may collect personal information such as your name, email address, company name, and phone number when you submit an inquiry through our contact form.
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to respond to your inquiries, provide demonstrations of our products, and communicate with you about our services.
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at info@nexbody.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

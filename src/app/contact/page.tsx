import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { InquiryForm } from "@/components/contact/InquiryForm";
import {
  isWhatsAppPlaceholder,
  siteConfig,
  WHATSAPP_MESSAGES,
  whatsappHref,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with NEXBODY. Book a demo of Nexbody-X60, OneScan or F20.",
};

export default function ContactPage() {
  const showWhatsApp = !isWhatsAppPlaceholder();

  return (
    <div className="relative z-10 page-shell">
      <div className="container-site">
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            title="Get in Touch"
            subtitle="Tell us about your clinic, gym or research lab. We'll prepare a tailored demo."
          />

          <p className="mt-4 text-center text-sm text-[var(--text-dim)]">
            Or email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text-primary)] hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
            {showWhatsApp && (
              <>
                {" · "}
                <a
                  href={whatsappHref(WHATSAPP_MESSAGES.float)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text-primary)] hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </>
            )}
          </p>

          <div className="mt-10 rounded-2xl border border-[var(--surface-border)] glass p-8">
            <InquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}

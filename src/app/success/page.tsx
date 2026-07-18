import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import {
  isWhatsAppPlaceholder,
  WHATSAPP_MESSAGES,
  whatsappHref,
  siteConfig,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your inquiry has been submitted successfully.",
};

export default function SuccessPage() {
  const showWhatsApp = !isWhatsAppPlaceholder();

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-var(--header-height))] items-center justify-center pt-[var(--header-height)]">
      <div className="px-6 text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[var(--brand-green)]/10">
          <CheckCircle2 className="size-8 text-[var(--brand-green)]" />
        </div>
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.03em]">
          Thank You!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--text-muted)]">
          Your inquiry has been submitted successfully. Our team will review
          your information and get back to you within 24 hours — usually much
          sooner during business hours.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {showWhatsApp && (
            <a
              href={whatsappHref(WHATSAPP_MESSAGES.afterInquiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(37,211,102,0.28)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(37,211,102,0.36)]"
            >
              <MessageCircle className="size-4" />
              Continue on WhatsApp
            </a>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--brand-accent)]/40 hover:bg-[var(--brand)]/10"
          >
            Back to Home
          </Link>
        </div>

        <p className="mx-auto mt-6 max-w-sm text-xs text-[var(--text-dim)]">
          Prefer email? Reach us at{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text-primary)] hover:underline"
          >
            {siteConfig.contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { siteConfig, whatsappHref, isWhatsAppPlaceholder } from "@/lib/site-config";

export function Footer() {
  const showWhatsApp = !isWhatsAppPlaceholder();

  return (
    <footer className="relative z-10 border-t border-[var(--surface-border)] bg-[var(--background)]">
      <div className="container-site flex flex-col gap-6 py-10 text-sm text-[var(--text-muted)] md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="font-medium text-[var(--text-primary)]">
            {siteConfig.siteName}
          </p>
          <p className="max-w-xs text-[var(--text-dim)]">{siteConfig.tagline}</p>
          <p className="pt-1">
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="transition-colors hover:text-[var(--text-primary)]"
            >
              {siteConfig.contactEmail}
            </a>
            {showWhatsApp && (
              <>
                {" · "}
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  WhatsApp
                </a>
              </>
            )}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--text-primary)]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/privacy"
            className="transition-colors hover:text-[var(--text-primary)]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-[var(--text-primary)]"
          >
            Terms of Service
          </Link>
        </nav>
      </div>

      <div className="container-site border-t border-[var(--surface-border)] py-5 text-xs text-[var(--text-dim)]">
        &copy; {new Date().getFullYear()} {siteConfig.siteName}. All rights
        reserved.
      </div>
    </footer>
  );
}

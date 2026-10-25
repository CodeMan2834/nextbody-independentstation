import Link from "next/link";
function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></>,
    Facebook: <path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V1h-3c-4 0-5 2.5-5 6v2H7v4h3v8" />,
    LinkedIn: <><path d="M4 9v12M4 3v1M9 21V9h4v2c1-3 7-3 7 3v7M13 14v7" /><circle cx="4" cy="3.5" r="1" /></>,
  };
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || <path d="M7 17 17 7M7 7h10v10" />}</svg>;
}
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

        {siteConfig.socialLinks.length > 0 && <nav aria-label="Social media" className="flex flex-wrap gap-4">{siteConfig.socialLinks.map((item) => { return <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2 hover:text-white"><SocialIcon name={item.label} />{item.label}<span className="sr-only"> (opens in a new tab)</span></a>; })}</nav>}
        <nav className="flex max-w-md flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
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
          <button type="button" data-analytics-toggle className="text-left transition-colors hover:text-[var(--text-primary)]">Disable basic analytics</button>
        </nav>
      </div>

      <div className="container-site border-t border-[var(--surface-border)] py-5 text-xs text-[var(--text-dim)]">
        &copy; {new Date().getFullYear()} {siteConfig.siteName}. All rights
        reserved.
      </div>
    </footer>
  );
}

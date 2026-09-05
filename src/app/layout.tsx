import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { BackToTop } from "@/components/layout/BackToTop";
import enMessages from "@/messages/en.json";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NEXBODY — Precision Body Assessment, Reimagined",
    template: "%s | NEXBODY",
  },
  description:
    "Nexbody-X60 combines 3D depth vision, eight-electrode composition analysis and guided neck-shoulder mobility. OneScan covers gait. F20 captures 3D morphology of both feet.",
  metadataBase: new URL("https://nexbodyfit.com"),
  openGraph: {
    type: "website",
    locale: "en",
    siteName: "NEXBODY",
    images: [{ url: "/media/products/x60/x60-cover.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/media/products/x60/x60-cover.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--brand)] focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <BackToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

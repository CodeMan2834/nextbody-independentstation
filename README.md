# NextBody Web

**3D body scanner B2B marketing site** — targeting premium gym operators in MENA and Southeast Asia.

NextBody produces professional body-assessment systems: **Nexbody-X60** (posture, composition, mobility), **OneScan** (gait / plantar pressure), and **F20** (3D scanning of both feet). This site is the product showcase and inquiry channel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| Animations | GSAP (ScrollTrigger) |
| Components | shadcn/ui + Base UI |
| Icons | Lucide React |
| Forms | Zod v4 + Server Actions |
| Email | Resend |
| i18n | next-intl (English; Arabic RTL ready) |
| Content | Content Collections (MDX — Phase 2) |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm

### Setup

```bash
cd nextbody-web
npm install
```

### Environment Variables

Copy `.env.example` → `.env.local` and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes (prod) | API key from [resend.com](https://resend.com) |
| `EMAIL_FROM` | Yes (prod) | Verified sender address on Resend |
| `EMAIL_TO` | Yes (prod) | Email that receives inquiries |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes (prod) | WhatsApp Business number in E.164 format |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL for SEO |

Without `RESEND_API_KEY`: forms succeed but inquiries are logged to the server console only (no email delivery).  
Without a real WhatsApp number: the WhatsApp float button and "Continue on WhatsApp" link auto-hide.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── actions/           # Server Actions (form submission)
├── app/               # File-based routes (App Router)
│   ├── page.tsx       # Homepage (12 sections)
│   ├── products/      # Product listing + detail pages
│   ├── contact/       # Inquiry form
│   ├── success/       # Post-submission confirmation
│   ├── terms/         # Terms of service
│   └── privacy/       # Privacy policy
├── components/
│   ├── home/          # Homepage sections (Hero, Narrative, etc.)
│   ├── layout/        # Header, Footer, MobileNav, WhatsAppFloat
│   ├── contact/       # InquiryForm
│   ├── shared/        # Reusable blocks (CTA, MediaBlock, etc.)
│   └── ui/            # shadcn primitives (Button, Input, etc.)
├── hooks/             # useReducedMotion, useIsMobile, useGSAP, etc.
├── i18n/              # next-intl routing + request config
├── lib/               # Constants, site config, email, products data
└── messages/          # i18n translation files (en.json)
```

---

## Site Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — X60 workstation, OneScan and F20 family, use cases |
| `/products` | Product listing (X60 / OneScan / F20) |
| `/products/nexbody-x60` | X60 flagship detail |
| `/products/onescan-gait-analysis` | OneScan gait / pressure detail |
| `/products/f20-foot-scanner` | F20 3D foot scanner detail |
| `/contact` | Inquiry form → Resend email → WhatsApp follow-up |
| `/success` | Post-submission confirmation |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

---

## Deploy

### Vercel (recommended)

1. Push this repo to GitHub/GitLab
2. Import `nextbody-web/` as a Vercel project
3. Set all 5 environment variables in Project Settings → Environment Variables
4. Point your domain DNS to Vercel

### Verification Checklist

1. Fill and submit the form at `/contact`
2. Verify redirect to `/success` with WhatsApp button
3. Check `EMAIL_TO` inbox for the inquiry email (Reply-To matches customer email)
4. Tap the green WhatsApp float → opens `wa.me` with pre-filled message

---

## Remaining Work

See `docs/NEXTBODY-SITE-AUDIT.md` for current status and `docs/NEXTBODY-LAUNCH-CHECKLIST.md` for launch requirements.

**Priority tasks:**
- Provide a dedicated F20 hardware photo (cover is currently rendered from the product PDF)
- Configure real WhatsApp number and rotate exposed API keys
- Legal review of remaining marketing claims

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

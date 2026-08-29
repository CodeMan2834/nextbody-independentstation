# NextBody Web — Development Progress

> Last updated: 2026-08-29

## ✅ Done (2026-08-29 session)

### Domain Migration → nexbodyfit.com
- [x] Code + env migrated from `nexbodyfix.com` → `nexbodyfit.com` (site URL, metadata, emails, sitemap, robots, llms.txt, OG image, CMS settings)
- [ ] Buy `nexbodyfit.com` at registrar
- [ ] Vercel: add `nexbodyfit.com` as domain, then remove `nexbodyfix.com`
- [ ] Cloudflare: DNS records for `nexbodyfit.com` (CNAME → Vercel + Resend mail records)
- [ ] Resend: verify `nexbodyfit.com`, add sending domain
- [ ] Vercel env vars: update `NEXT_PUBLIC_SITE_URL`, `EMAIL_FROM`

## ✅ Done (2026-07-25 session)

### Code Quality
- [x] TypeScript build passes (fixed TrustBar.tsx icon lookup type error)
- [x] All `nextbody.fit` references replaced with `nexbodyfit.com` (10 files)
- [x] `src/app/sitemap.ts` — auto-generated sitemap.xml, 7 pages, static prerendered

### Email / Contact Form
- [x] Resend account registered (GitHub login)
- [x] Domain `nexbodyfit.com` verified in Resend (Tokyo ap-northeast-1)
- [x] DNS: DKIM + SPF + MX (send + @) + DMARC — 5 records via Cloudflare
- [x] `.env.local` configured with real values
- [x] Contact form → Resend → QQ email tested successfully (local)

### Deployment
- [x] Vercel project `nexbody/nextbody-web` created
- [x] Git pushed to GitHub → Vercel auto-deploy triggered
- [x] Production URL `nextbody-web.vercel.app` live
- [x] Custom domain `nexbodyfit.com` added + CNAME DNS configured
- [x] Vercel Domain status: green ✓
- [x] Vercel env vars set in Dashboard (RESEND_API_KEY, EMAIL_FROM, EMAIL_TO)
- [x] SSL/TLS working (Full mode via Cloudflare)
- [x] Deployed build passes (same as local)

## 🔒 Action Required — Credential Rotation

These were exposed in chat logs. Rotate in respective dashboards:
- [ ] **Resend API Key** — Resend → Settings → API Keys → delete old, create new → update `.env.local` + Vercel env
- [ ] **Vercel Token** — Vercel → Account → Tokens → delete old

## 📋 TODO (priority order)

### P0 — Complete Before Public Launch
- [ ] Replace WhatsApp placeholder `+971000000000` with real number (`.env.local` + Vercel env)
- [ ] Confirm `EMAIL_TO` for production (currently personal QQ)

### P1 — Content Polish
- [ ] Distinct product images for S30 vs S20 (both use `f20-product.webp` now)
- [ ] Remove unused `public/video/product-loop.mp4` (not referenced in code)
- [ ] Verify all image/video paths work in production
- [ ] Replace placeholder social links (LinkedIn, Instagram)

### P2 — SEO & Performance
- [ ] Add `error.tsx` for all routes (blank on errors currently)
- [ ] Add `loading.tsx` for all routes (no loading skeletons)
- [ ] Convert marketing pages to static where possible (all routes are `ƒ dynamic`)
- [ ] Add JSON-LD structured data for product pages (Google Rich Snippets)
- [ ] Add analytics (Google Analytics / Plausible / Vercel Analytics)
- [ ] Cookie consent banner (GDPR)

### P3 — Nice to Have
- [ ] `manifest.json` for PWA install
- [ ] S20 dedicated SVG device image (reuses S30 SVG now)
- [ ] Consolidate `content/site-settings.mdx` and `content/site-settings.json` (duplicate data risk)
- [ ] Apple touch icon / favicon proper sizes

## Environment Variables

| Var | Value | Where |
|-----|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://nexbodyfit.com` | `.env.local` + Vercel |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `+971000000000` (placeholder) | `.env.local` |
| `RESEND_API_KEY` | `re_...` | `.env.local` + Vercel |
| `EMAIL_FROM` | `NextBody <inquiry@nexbodyfit.com>` | `.env.local` + Vercel |
| `EMAIL_TO` | `825405532@qq.com` | `.env.local` + Vercel |

## URLs

| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:3000` |
| Vercel preview | `https://nextbody-web.vercel.app` |
| Production | `https://nexbodyfit.com` |

## Build & Run

```bash
npm run dev     # Dev server (Turbopack)
npm run build   # Production build
npm run lint    # ESLint
npm run cms     # Decap CMS local proxy
```

Routes: `/` `/products` `/products/[slug]` `/contact` `/success` `/privacy` `/terms` `/sitemap.xml`

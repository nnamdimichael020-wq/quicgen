# QuicGen

**Generate Anything. Instantly.**

QuicGen is a fast, responsive collection of free online tools. Every tool runs in the visitor’s browser: content entered into a tool is not uploaded to a QuicGen application server. The app has a dark-first theme, a complete light theme, no accounts and no analytics or tracking scripts.

## Start locally

```bash
npm install
npm run dev
```

Vite serves the app on `http://localhost:5173`. Production output is created with:

```bash
npm run typecheck
npm run build
npm test
npm run preview
```

The build runs TypeScript checks, creates the optimized Vite bundle, and generates route-specific HTML metadata, JSON-LD, `sitemap.xml` and `robots.txt`. Set the canonical site origin before deployment:

```bash
cp .env.example .env
# Edit VITE_SITE_URL to the site's exact HTTPS origin, without a trailing slash.
```

The SEO build step defaults to QuicGen’s current live origin, `https://quicgen.nnamdimichael020.workers.dev`. When `quicgen.com` is pointed at production, change `VITE_SITE_URL` in the deployment environment to `https://quicgen.com`; the same origin then flows through canonical tags, Open Graph/Twitter URLs, `robots.txt` and the generated sitemap.

## What’s included

- **QR code generator:** styled QR codes for URLs, text, Wi-Fi, contacts, email, SMS and phone; optional local logo, error correction, frames and labels; selectable 512, 1,200 or 2,400 px PNG/PDF exports, vector SVG, copyable payloads and bulk ZIP creation.
- **Password generator:** secure Web Crypto randomness, configurable character sets and length, look-alike exclusion, pronounceable mode, local strength estimate, show/hide, copy and opt-in device-only history.
- **UUID v4 generator** and secure random numbers, strings, color palettes and dice rolls.
- **Calculators:** percentage variations, tips and bill splitting, time arithmetic and date difference/addition/age.
- **Text and developer utilities:** word and character counts, case conversion, Lorem Ipsum, color conversion, UTF-8 Base64, and MD5/SHA-1/SHA-256 digests (with clear legacy-hash warnings).
- Responsive layouts, keyboard focus states, reduced-motion support, accessible labels, a searchable tool catalog, tool-specific how-tos, related guides and topic collections, a post-success bookmark/install reminder with a saved choice, privacy and help pages, and a custom not-found route.
- **17 long-form guides** (at least 1,200 words each) under `/blog`, plus four curated topic collections under `/topics`.

## Privacy model

The app does not have an API or database. QR payloads, text, dates, colors, hashes and generated results are handled client-side. Browser storage is limited to the theme preference, the choice made on the one-time bookmark reminder, and optional password history. The reminder appears only after a successful tool action; accepting or dismissing it is remembered, and the preference can be cleared from **Privacy first** in the header. Password history is off by default. No third-party analytics, font requests or advertising tags are shipped.

A web host still receives the ordinary technical requests needed to deliver website files. If ads or other third-party services are introduced later, update the privacy policy and consent behavior before enabling them. No ads are served.

## SEO and deployment notes

- `scripts/generate-seo.mjs` creates route-specific HTML entries, unique title and description, canonical/Open Graph/Twitter metadata, and JSON-LD (WebApplication/FAQ/BreadcrumbList, Article/HowTo/FAQPage, or topic CollectionPage) for the tools, 17 guide articles, four topic pages and static pages.
- `public/og-image.png` is the default share image (`og-image.svg` is also included); `public/favicon.svg` and `public/site.webmanifest` provide the app identity.
- **Production host: Cloudflare Workers (static assets).** The CI deploy command is `npx wrangler deploy`; `wrangler` is pinned as a devDependency so CI always runs the exact version the site was verified with. Wrangler auto-configures the Vite static-asset deployment (build tool: Vite, build command: `npm run build`, output: `dist/`) and deploys it. The generated `dist/_redirects` rewrites clean tool URLs to their route-specific HTML with `200` proxy rules so canonical URLs are served without trailing-slash redirects; it only uses status codes accepted by Cloudflare (200/301/302/303/307/308 — the Netlify-only `!` flag and 404 rewrites are rejected by the Cloudflare API). Unknown routes fall back to the SPA shell and render the custom not-found page client-side.
- Optional upgrade: change the Cloudflare build deploy command to `npm run build && npx wrangler deploy` and commit a `wrangler.jsonc` with `assets.not_found_handling: "404-page"` so unknown routes return a real HTTP 404 from the pre-rendered `404.html`. Do not commit `wrangler.jsonc` while the deploy command is the bare `npx wrangler deploy` — the committed config makes wrangler skip its setup step, which is what runs the build.
- `vercel.json` provides the equivalent clean-URL rewrites for Vercel deploys. On other static hosts, add rewrites from `/<route>` to `/<route>/index.html` and configure `404.html` as the not-found document.
- Configure your final domain in `VITE_SITE_URL`; submit the generated `/sitemap.xml` in Search Console after launch.
- QR downloads, hashing and other browser features need a modern browser. Clipboard copying uses the secure Clipboard API when available and a local fallback otherwise.

## Stack

Vite · React · TypeScript · React Router · Lucide icons · `qr-code-styling` · jsPDF · JSZip · `@noble/hashes`

No Tailwind/shadcn runtime is needed: the app uses a compact, token-based CSS system with equivalent reusable components and theme-aware styles.

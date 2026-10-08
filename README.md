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

The SEO build step defaults to `https://quicgen.com`; update `VITE_SITE_URL` if the production domain is different. The same origin is used for canonical tags, social metadata and the generated sitemap.

## What’s included

- **QR code generator:** styled QR codes for URLs, text, Wi-Fi, contacts, email, SMS and phone; optional local logo, error correction, frames and labels; high-resolution PNG, SVG and PDF export; bulk creation to a ZIP.
- **Password generator:** secure Web Crypto randomness, configurable character sets and length, look-alike exclusion, pronounceable mode, local strength estimate, show/hide, copy and opt-in device-only history.
- **UUID v4 generator** and secure random numbers, strings, color palettes and dice rolls.
- **Calculators:** percentage variations, tips and bill splitting, time arithmetic and date difference/addition/age.
- **Text and developer utilities:** word and character counts, case conversion, Lorem Ipsum, color conversion, UTF-8 Base64, and MD5/SHA-1/SHA-256 digests (with clear legacy-hash warnings).
- Responsive layouts, keyboard focus states, reduced-motion support, accessible labels, a searchable tool catalog, unique tool-page content, related-tool links, privacy and help pages, and a custom not-found route.

## Privacy model

The app does not have an API or database. QR payloads, text, dates, colors, hashes and generated results are handled client-side. Browser storage is limited to the theme preference and optional password history. The password history is off by default and can be cleared from **Privacy first** in the header. No third-party analytics, font requests or advertising tags are shipped.

A web host still receives the ordinary technical requests needed to deliver website files. If ads or other third-party services are introduced later, update the privacy policy and consent behavior before enabling them. Ad placement is currently represented only by a clearly labeled, inert layout placeholder; no ads are served.

## SEO and deployment notes

- `scripts/generate-seo.mjs` creates an HTML entry with unique title, description, Open Graph/Twitter tags, canonical URL and relevant JSON-LD for each public route.
- `public/og-image.png` is the default share image (`og-image.svg` is also included); `public/favicon.svg` and `public/site.webmanifest` provide the app identity.
- Netlify’s generated `dist/_redirects` and the included `vercel.json` rewrite clean tool URLs to their route-specific HTML before React hydrates; unknown Netlify paths return the custom 404 with a proper 404 status. On other static hosts, add equivalent clean-URL rewrites to the generated `/<route>/index.html` files and configure `404.html` as the not-found document.
- Configure your final domain in `VITE_SITE_URL`; submit the generated `/sitemap.xml` in Search Console after launch.
- QR downloads, hashing and other browser features need a modern browser. Clipboard copying uses the secure Clipboard API when available and a local fallback otherwise.

## Stack

Vite · React · TypeScript · React Router · Lucide icons · `qr-code-styling` · jsPDF · JSZip · `@noble/hashes`

No Tailwind/shadcn runtime is needed: the app uses a compact, token-based CSS system with equivalent reusable components and theme-aware styles.

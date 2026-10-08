import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.cwd(), 'dist');
function readSiteUrlFromEnvFiles() {
  for (const file of ['.env.production.local', '.env.local', '.env.production', '.env']) {
    const filePath = join(process.cwd(), file);
    if (!existsSync(filePath)) continue;
    const match = readFileSync(filePath, 'utf8').match(/^\s*VITE_SITE_URL\s*=\s*(.+?)\s*$/m);
    if (match) return match[1].replace(/^['\"]|['\"]$/g, '').trim();
  }
  return '';
}
const siteUrl = (process.env.VITE_SITE_URL || readSiteUrlFromEnvFiles() || 'https://quicgen.com').replace(/\/$/, '');
const ogImage = `${siteUrl}/og-image.png`;
const baseHtml = readFileSync(join(out, 'index.html'), 'utf8');
const pages = [
  { path: '/', title: 'Free Online Tools That Respect Your Privacy | QuicGen', description: 'Generate anything, instantly. QuicGen is a collection of fast, beautifully simple online tools—QR codes, passwords, calculators and more—that run in your browser.', type: 'WebSite' },
  { path: '/qr-code-generator', title: 'Free QR Code Generator — Custom, Private & Downloadable | QuicGen', description: 'Create custom QR codes for URLs, Wi-Fi, contacts, email and more. Style and download high-resolution PNG, SVG or PDF—right in your browser.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/password-generator', title: 'Secure Password Generator & Strength Checker | QuicGen', description: 'Generate strong, customizable passwords with cryptographically secure randomness. Check password strength privately in your browser.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/uuid-generator', title: 'Free UUID v4 Generator — Generate IDs in Bulk | QuicGen', description: 'Generate secure, random UUID version 4 identifiers in batches. Copy individual IDs, copy all, or download a text file. Runs locally.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/random-number-generator', title: 'Random Number Generator — Secure & Custom Range | QuicGen', description: 'Generate random numbers between any whole-number limits. Choose quantity and unique results using browser-based secure randomness.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/random-string-generator', title: 'Random String Generator — Custom Characters & Length | QuicGen', description: 'Create random strings with letters, digits and symbols. Customize length and character sets, then copy results instantly.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/random-color-generator', title: 'Random Color Generator — HEX, RGB & HSL | QuicGen', description: 'Generate a palette of random colors and copy HEX, RGB or HSL values. A fast, private color inspiration tool.', type: 'WebApplication', category: 'DesignApplication' },
  { path: '/dice-roller', title: 'Online Dice Roller — Roll Multiple Dice | QuicGen', description: 'Roll one or more virtual dice with customizable sides. See each result, the total and your recent rolls—all locally.', type: 'WebApplication', category: 'GamesApplication' },
  { path: '/percentage-calculator', title: 'Percentage Calculator — Find Percentages & Change | QuicGen', description: 'Calculate a percentage of a value, find what percent one number is of another, or work out percentage change. Instant and free.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/tip-calculator', title: 'Tip Calculator — Split the Bill & Calculate Tips | QuicGen', description: 'Calculate a restaurant tip, total bill and per-person share. Adjust the tip percentage and number of people for an instant result.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/time-calculator', title: 'Time Calculator — Add & Subtract Hours and Minutes | QuicGen', description: 'Quickly add or subtract hours and minutes from a time. See the resulting time and day offset with a clear 12 or 24-hour clock.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/date-calculator', title: 'Date Calculator — Date Difference, Add Days & Age | QuicGen', description: 'Calculate the days between two dates, add or subtract days from a date, or find an age. Accurate calendar calculations, no sign-up.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/word-counter', title: 'Word Counter — Words, Characters & Reading Time | QuicGen', description: 'Count words, characters with and without spaces, sentences and paragraphs. Get a live reading-time estimate as you type.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/case-converter', title: 'Case Converter — Uppercase, Lowercase, Title Case & More | QuicGen', description: 'Convert text to uppercase, lowercase, title case, sentence case or alternating case instantly. Copy your result in one click.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/lorem-ipsum-generator', title: 'Lorem Ipsum Generator — Free Placeholder Text | QuicGen', description: 'Generate Lorem Ipsum placeholder text by paragraph, sentence or word count. Copy clean filler text instantly and privately.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/color-picker', title: 'Color Picker & Converter — HEX, RGB and HSL | QuicGen', description: 'Pick a color visually or enter a HEX value. Instantly convert between HEX, RGB and HSL and copy the format you need.', type: 'WebApplication', category: 'DesignApplication' },
  { path: '/base64-encoder-decoder', title: 'Base64 Encoder & Decoder — Convert Text Locally | QuicGen', description: 'Encode plain text as Base64 or decode Base64 into UTF-8 text. Conversion happens locally in your browser with clear error feedback.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/hash-generator', title: 'Hash Generator — MD5, SHA-1 & SHA-256 | QuicGen', description: 'Generate MD5, SHA-1 and SHA-256 hashes from text in your browser. Private by design, with clear guidance about legacy algorithms.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/about', title: 'About QuicGen — Useful Tools, Thoughtfully Made', description: 'Meet QuicGen: a growing collection of thoughtful, free online tools built for speed, simplicity and privacy.', type: 'AboutPage' },
  { path: '/privacy', title: 'Privacy Policy — Your Data Stays Yours | QuicGen', description: 'Read how QuicGen protects your privacy: your tool inputs stay in your browser, with transparent details about local storage and site hosting.', type: 'WebPage' },
  { path: '/help', title: 'Help Center — Guides, FAQs & Privacy | QuicGen', description: 'Learn how to use QuicGen tools, understand what happens to your data, and find answers to common questions.', type: 'FAQPage' },
];

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function meta(name, content, property = false) {
  return `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}" />`;
}
function schemaFor(page) {
  const url = `${siteUrl}${page.path}`;
  if (page.type === 'WebApplication') return { '@context': 'https://schema.org', '@type': 'WebApplication', name: `QuicGen ${page.title.split(' — ')[0].split(' | ')[0]}`, url, applicationCategory: page.category, operatingSystem: 'Any', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: page.description };
  if (page.type === 'WebSite') return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'QuicGen', url: `${siteUrl}/`, description: page.description };
  if (page.type === 'FAQPage') return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Does QuicGen collect what I type?', acceptedAnswer: { '@type': 'Answer', text: 'No. Tool inputs are processed in your browser and are not sent to QuicGen.' } }, { '@type': 'Question', name: 'Is QuicGen free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. QuicGen tools are free to use, with no account required.' } }] };
  return { '@context': 'https://schema.org', '@type': page.type, name: page.title.split(' | ')[0], url };
}
function renderPage(page) {
  let html = baseHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*\/>/, meta('description', page.description));
  html = html.replace(/<meta property="og:title"[^>]*\/>/, meta('og:title', page.title, true));
  html = html.replace(/<meta property="og:description"[^>]*\/>/, meta('og:description', page.description, true));
  html = html.replace(/<meta property="og:type"[^>]*\/>/, meta('og:type', page.path === '/' ? 'website' : 'article', true));
  html = html.replace(/<meta property="og:image"[^>]*\/>/, meta('og:image', ogImage, true));
  html = html.replace(/<meta name="twitter:title"[^>]*\/>/, meta('twitter:title', page.title));
  html = html.replace(/<meta name="twitter:description"[^>]*\/>/, meta('twitter:description', page.description));
  html = html.replace(/<meta name="twitter:card"[^>]*\/>/, meta('twitter:card', 'summary_large_image'));
  const twitterImage = meta('twitter:image', ogImage);
  if (html.includes('</head>')) html = html.replace('</head>', `${meta('og:url', `${siteUrl}${page.path}`, true)}\n    <link rel="canonical" href="${escapeHtml(`${siteUrl}${page.path}`)}" />\n    ${twitterImage}\n    <script id="qg-structured-data" type="application/ld+json">${JSON.stringify(schemaFor(page)).replaceAll('<', '\\u003c')}</script>\n  </head>`);
  return html;
}

for (const page of pages) {
  const directory = page.path === '/' ? out : join(out, page.path.slice(1));
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), renderPage(page));
}
const notFound = renderPage({ path: '/404', title: 'Page Not Found | QuicGen', description: 'We could not find that page. Return to QuicGen to explore our free, private online tools.', type: 'WebPage' })
  .replace(/<meta name="robots"[^>]*\/>/, meta('robots', 'noindex, follow'));
writeFileSync(join(out, '404.html'), notFound);

const urls = pages.map((page) => `  <url><loc>${escapeHtml(`${siteUrl}${page.path}`)}</loc><changefreq>${page.path === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${page.path === '/' ? '1.0' : page.type === 'WebApplication' ? '0.8' : '0.5'}</priority></url>`).join('\n');
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
const routeRedirects = pages.filter((page) => page.path !== '/').map((page) => `${page.path} ${page.path}/index.html 200!`);
routeRedirects.push('/* /404.html 404');
writeFileSync(join(out, '_redirects'), `${routeRedirects.join('\n')}\n`);
console.log(`Generated SEO metadata and sitemap for ${pages.length} routes at ${siteUrl}`);

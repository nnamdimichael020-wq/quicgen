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
const siteUrl = (process.env.VITE_SITE_URL || readSiteUrlFromEnvFiles() || 'https://quicgen.nnamdimichael020.workers.dev').replace(/\/$/, '');
const ogImage = `${siteUrl}/og-image.png`;
const baseHtml = readFileSync(join(out, 'index.html'), 'utf8');
const guideEntries = JSON.parse(readFileSync(join(process.cwd(), 'src/data/guides.json'), 'utf8'));
const topicEntries = JSON.parse(readFileSync(join(process.cwd(), 'src/data/topics.json'), 'utf8'));
const toolContentEntries = JSON.parse(readFileSync(join(process.cwd(), 'src/data/tool-content.json'), 'utf8'));
const pages = [
  { path: '/', title: 'Free Online Tools That Respect Your Privacy | QuicGen', description: 'Generate anything, instantly. QuicGen is a collection of fast, beautifully simple online tools—QR codes, passwords, calculators and more—that run in your browser.', type: 'WebSite' },
  { path: '/qr-code-generator', toolName: 'QR code generator', title: 'Free QR Code Generator — Custom, Private & Downloadable | QuicGen', description: 'Create custom QR codes for URLs, Wi-Fi, contacts, email and more. Style and download high-resolution PNG, SVG or PDF—right in your browser.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/password-generator', toolName: 'Password generator', title: 'Secure Password Generator & Strength Checker | QuicGen', description: 'Generate strong, customizable passwords with cryptographically secure randomness. Check password strength privately in your browser.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/uuid-generator', toolName: 'UUID generator', title: 'Free UUID v4 Generator — Generate IDs in Bulk | QuicGen', description: 'Generate secure, random UUID version 4 identifiers in batches. Copy individual IDs, copy all, or download a text file. Runs locally.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/random-number-generator', toolName: 'Random number generator', title: 'Random Number Generator — Secure & Custom Range | QuicGen', description: 'Generate random numbers between any whole-number limits. Choose quantity and unique results using browser-based secure randomness.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/random-string-generator', toolName: 'Random string generator', title: 'Random String Generator — Custom Characters & Length | QuicGen', description: 'Create random strings with letters, digits and symbols. Customize length and character sets, then copy results instantly.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/random-color-generator', toolName: 'Random color generator', title: 'Random Color Generator — HEX, RGB & HSL | QuicGen', description: 'Generate a palette of random colors and copy HEX, RGB or HSL values. A fast, private color inspiration tool.', type: 'WebApplication', category: 'DesignApplication' },
  { path: '/dice-roller', toolName: 'Dice roller', title: 'Online Dice Roller — Roll Multiple Dice | QuicGen', description: 'Roll one or more virtual dice with customizable sides. See each result, the total and your recent rolls—all locally.', type: 'WebApplication', category: 'GamesApplication' },
  { path: '/percentage-calculator', toolName: 'Percentage calculator', title: 'Percentage Calculator — Find Percentages & Change | QuicGen', description: 'Calculate a percentage of a value, find what percent one number is of another, or work out percentage change. Instant and free.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/tip-calculator', toolName: 'Tip calculator', title: 'Tip Calculator — Split the Bill & Calculate Tips | QuicGen', description: 'Calculate a restaurant tip, total bill and per-person share. Adjust the tip percentage and number of people for an instant result.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/time-calculator', toolName: 'Time calculator', title: 'Time Calculator — Add & Subtract Hours and Minutes | QuicGen', description: 'Quickly add or subtract hours and minutes from a time. See the resulting time and day offset with a clear 12 or 24-hour clock.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/date-calculator', toolName: 'Date calculator', title: 'Date Calculator — Date Difference, Add Days & Age | QuicGen', description: 'Calculate the days between two dates, add or subtract days from a date, or find an age. Accurate calendar calculations, no sign-up.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/word-counter', toolName: 'Word counter', title: 'Word Counter — Words, Characters & Reading Time | QuicGen', description: 'Count words, characters with and without spaces, sentences and paragraphs. Get a live reading-time estimate as you type.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/case-converter', toolName: 'Case converter', title: 'Case Converter — Uppercase, Lowercase, Title Case & More | QuicGen', description: 'Convert text to uppercase, lowercase, title case, sentence case or alternating case instantly. Copy your result in one click.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/lorem-ipsum-generator', toolName: 'Lorem ipsum generator', title: 'Lorem Ipsum Generator — Free Placeholder Text | QuicGen', description: 'Generate Lorem Ipsum placeholder text by paragraph, sentence or word count. Copy clean filler text instantly and privately.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/color-picker', toolName: 'Color picker & converter', title: 'Color Picker & Converter — HEX, RGB and HSL | QuicGen', description: 'Pick a color visually or enter a HEX value. Instantly convert between HEX, RGB and HSL and copy the format you need.', type: 'WebApplication', category: 'DesignApplication' },
  { path: '/base64-encoder-decoder', toolName: 'Base64 encoder & decoder', title: 'Base64 Encoder & Decoder — Convert Text Locally | QuicGen', description: 'Encode plain text as Base64 or decode Base64 into UTF-8 text. Conversion happens locally in your browser with clear error feedback.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/hash-generator', toolName: 'Hash generator', title: 'Hash Generator — MD5, SHA-1 & SHA-256 | QuicGen', description: 'Generate MD5, SHA-1 and SHA-256 hashes from text in your browser. Private by design, with clear guidance about legacy algorithms.', type: 'WebApplication', category: 'UtilitiesApplication' },
  { path: '/about', title: 'About QuicGen — Useful Tools, Thoughtfully Made', description: 'Meet QuicGen: a growing collection of thoughtful, free online tools built for speed, simplicity and privacy.', type: 'AboutPage' },
  { path: '/privacy', title: 'Privacy Policy — Your Data Stays Yours | QuicGen', description: 'Read how QuicGen protects your privacy: your tool inputs stay in your browser, with transparent details about local storage and site hosting.', type: 'WebPage' },
  { path: '/help', title: 'Help Center — Guides, FAQs & Privacy | QuicGen', description: 'Learn how to use QuicGen tools, understand what happens to your data, and find answers to common questions.', type: 'FAQPage' },
  { path: '/blog', title: 'QuicGen Blog & Practical Tool Guides', description: 'Read practical, privacy-first guides for QR codes, strong passwords, calculators, text tools, color formats and browser utilities.', type: 'Blog' },
  { path: '/topics', title: 'Explore QuicGen Topics & Tool Collections', description: 'Browse focused collections of privacy-first tools and practical guides for QR codes, password security and everyday calculators.', type: 'CollectionPage' },
  ...guideEntries.map((guide) => ({ path: `/blog/${guide.slug}`, title: `${guide.title} | QuicGen`, description: guide.description, type: 'Article', ogType: 'article', article: guide })),
  ...topicEntries.map((topic) => ({ path: `/topics/${topic.slug}`, title: `${topic.title} | QuicGen`, description: topic.description, type: 'CollectionPage', topic })),
];

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function meta(name, content, property = false) {
  return `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}" />`;
}
const toolPages = pages.filter((page) => page.type === 'WebApplication');
function toolContentFor(page) {
  return toolContentEntries[page.path.slice(1)] ?? null;
}
function schemaFor(page) {
  const url = `${siteUrl}${page.path}`;
  if (page.type === 'WebApplication') {
    const content = toolContentFor(page);
    const name = page.toolName ?? page.title.split(' — ')[0].split(' | ')[0];
    const faqMainEntity = (content?.faqs ?? []).map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } }));
    return { '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebApplication', name: `QuicGen ${name}`, url, applicationCategory: page.category, operatingSystem: 'Any', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: page.description, featureList: ['Free to use', 'Processes data in your browser', ...(content?.faqs ?? []).slice(0, 2).map((faq) => faq.question)] },
      ...(content ? [{ '@type': 'HowTo', name: `How to use the ${name}`, description: page.description, totalTime: 'PT2M', step: content.howTo.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: `Step ${index + 1}`, text: step })) }] : []),
      ...(faqMainEntity.length ? [{ '@type': 'FAQPage', mainEntity: faqMainEntity }] : []),
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${siteUrl}/#tools` },
        { '@type': 'ListItem', position: 3, name, item: url },
      ] },
    ] };
  }
  if (page.type === 'WebSite') return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'QuicGen', url: `${siteUrl}/`, description: page.description };
  if (page.type === 'FAQPage') return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Does QuicGen collect what I type?', acceptedAnswer: { '@type': 'Answer', text: 'No. Tool inputs are processed in your browser and are not sent to QuicGen.' } }, { '@type': 'Question', name: 'Is QuicGen free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. QuicGen tools are free to use, with no account required.' } }] };
  if (page.type === 'Article') {
    const guide = page.article;
    return { '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', headline: guide.title, description: guide.description, url, mainEntityOfPage: url, datePublished: '2026-10-09', dateModified: '2026-10-09', author: { '@type': 'Organization', name: 'QuicGen' }, publisher: { '@type': 'Organization', name: 'QuicGen', url: siteUrl }, image: ogImage },
      { '@type': 'HowTo', name: guide.title, description: guide.description, step: guide.steps.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.title, text: step.body })) },
      { '@type': 'FAQPage', mainEntity: guide.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    ] };
  }
  if (page.type === 'CollectionPage' && page.topic) {
    const topic = page.topic;
    const itemList = [...topic.toolSlugs.map((slug) => ({ '@type': 'ListItem', url: `${siteUrl}/${slug}` })), ...topic.guideSlugs.map((slug) => ({ '@type': 'ListItem', url: `${siteUrl}/blog/${slug}` }))];
    return { '@context': 'https://schema.org', '@graph': [
      { '@type': 'CollectionPage', name: topic.title, description: topic.description, url, mainEntity: { '@type': 'ItemList', itemListElement: itemList } },
      { '@type': 'FAQPage', mainEntity: topic.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    ] };
  }
  return { '@context': 'https://schema.org', '@type': page.type, name: page.title.split(' | ')[0], url };
}

// ---------------------------------------------------------------------------
// Prerendered body copy: real content in the raw HTML so crawlers without full
// JavaScript rendering (and readers with JS disabled) never see a thin page.
// The interactive React app replaces this block on boot, so the live layout is
// unchanged.
// ---------------------------------------------------------------------------
function navLinks(links) {
  return `<nav class="prerendered-page-nav">${links.map(([href, label]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join('')}</nav>`;
}
function faqBlock(faqs) {
  if (!faqs?.length) return '';
  return `<section><h2>Frequently asked questions</h2>${faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join('')}</section>`;
}
function prerenderedBody(page) {
  const parts = [];
  const href = (path) => `${siteUrl}${path}`;
  if (page.type === 'WebApplication') {
    const slug = page.path.slice(1);
    const content = toolContentFor(page);
    const guide = guideEntries.find((entry) => entry.toolSlug === slug);
    const topic = topicEntries.find((entry) => entry.toolSlugs.includes(slug));
    const siblingTools = toolPages.filter((other) => other.path !== page.path);
    parts.push(`<h1>${escapeHtml(page.toolName ?? page.title.split(' — ')[0].split(' | ')[0])}</h1>`);
    parts.push(`<p>${escapeHtml(page.description)}</p>`);
    if (content) {
      parts.push(`<p>${escapeHtml(content.intro)}</p>`);
      parts.push(`<section><h2>What the ${escapeHtml(page.toolName ?? 'tool')} does</h2>${content.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`);
      parts.push(`<section><h2>How to use the ${escapeHtml(page.toolName ?? 'tool')}</h2><ol>${content.howTo.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></section>`);
      parts.push(faqBlock(content.faqs));
    }
    if (guide) parts.push(`<section><h2>Related guide</h2><p><a href="${escapeHtml(href(`/blog/${guide.slug}`))}">${escapeHtml(guide.title)}</a> — ${escapeHtml(guide.excerpt)}</p></section>`);
    parts.push(navLinks([
      ...(guide ? [[href(`/blog/${guide.slug}`), 'Read the full guide']] : []),
      ...(topic ? [[href(`/topics/${topic.slug}`), `More on ${topic.title.split(':')[0]}`]] : []),
      [href('/blog'), 'All guides'],
      [href('/'), 'All tools'],
      ...siblingTools.slice(0, 3).map((other) => [href(other.path), other.toolName ?? other.title.split(' — ')[0].split(' | ')[0]]),
    ]));
  } else if (page.type === 'Article') {
    const guide = page.article;
    const toolPath = `/${guide.toolSlug}`;
    parts.push(`<h1>${escapeHtml(guide.title)}</h1>`);
    parts.push(`<p>${escapeHtml(guide.excerpt)}</p>`);
    guide.opening.forEach((paragraph) => parts.push(`<p>${escapeHtml(paragraph)}</p>`));
    parts.push(`<section><h2>Why this task deserves a clear process</h2><p>${escapeHtml(guide.purpose)}</p></section>`);
    parts.push(`<section><h2>A step-by-step walkthrough</h2><ol>${guide.steps.map((step) => `<li><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(step.body)}</p></li>`).join('')}</ol></section>`);
    parts.push(faqBlock(guide.faqs));
    parts.push(`<p>${escapeHtml(guide.closing)}</p>`);
    parts.push(navLinks([[href(toolPath), 'Open the tool'], [href('/blog'), 'All guides'], [href('/'), 'All tools']]));
  } else if (page.type === 'CollectionPage' && page.topic) {
    const topic = page.topic;
    parts.push(`<h1>${escapeHtml(topic.title)}</h1>`);
    parts.push(`<p>${escapeHtml(topic.description)}</p>`);
    topic.intro.forEach((paragraph) => parts.push(`<p>${escapeHtml(paragraph)}</p>`));
    parts.push(`<section><h2>In this topic</h2>${topic.sections.map((section) => `<h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.body)}</p>`).join('')}</section>`);
    parts.push(faqBlock(topic.faqs));
    parts.push(navLinks([
      ...topic.toolSlugs.map((slug) => [`/${slug}`, `Open ${slug.replaceAll('-', ' ')}`]),
      ...topic.guideSlugs.map((slug) => [`/blog/${slug}`, 'Read the guide']),
      [href('/topics'), 'All topics'],
    ]));
  } else if (page.path === '/') {
    parts.push(`<h1>QuicGen — generate anything, instantly</h1>`);
    parts.push(`<p>${escapeHtml(page.description)}</p>`);
    parts.push(`<section><h2>Free tools that run in your browser</h2><ul>${toolPages.map((tool) => `<li><a href="${escapeHtml(href(tool.path))}">${escapeHtml(tool.toolName ?? tool.title.split(' — ')[0].split(' | ')[0])}</a> — ${escapeHtml(tool.description)}</li>`).join('')}</ul></section>`);
    parts.push(navLinks([[href('/blog'), 'Practical guides'], [href('/topics'), 'Browse topics'], [href('/about'), 'About QuicGen'], [href('/privacy'), 'Privacy policy'], [href('/help'), 'Help center']]));
  } else if (page.path === '/blog') {
    parts.push(`<h1>QuicGen blog &amp; practical tool guides</h1>`);
    parts.push(`<p>${escapeHtml(page.description)}</p>`);
    parts.push(`<section><h2>Every guide, with its tool one click away</h2><ul>${guideEntries.map((guide) => `<li><a href="${escapeHtml(href(`/blog/${guide.slug}`))}">${escapeHtml(guide.title)}</a> — ${escapeHtml(guide.excerpt)}</li>`).join('')}</ul></section>`);
    parts.push(navLinks([[href('/topics'), 'Browse topics'], [href('/'), 'All tools']]));
  } else if (page.path === '/topics') {
    parts.push(`<h1>Explore QuicGen topics &amp; tool collections</h1>`);
    parts.push(`<p>${escapeHtml(page.description)}</p>`);
    parts.push(`<section><h2>Thoughtfully grouped</h2><ul>${topicEntries.map((topic) => `<li><a href="${escapeHtml(href(`/topics/${topic.slug}`))}">${escapeHtml(topic.title)}</a> — ${escapeHtml(topic.description)}</li>`).join('')}</ul></section>`);
    parts.push(navLinks([[href('/blog'), 'All guides'], [href('/'), 'All tools']]));
  } else {
    parts.push(`<h1>${escapeHtml(page.title.split(' | ')[0])}</h1>`);
    parts.push(`<p>${escapeHtml(page.description)}</p>`);
    parts.push(navLinks([[href('/'), 'All tools'], [href('/blog'), 'Guides'], [href('/topics'), 'Topics'], [href('/privacy'), 'Privacy policy'], [href('/help'), 'Help center']]));
  }
  return `<div class="prerendered-page" data-prerendered="${page.type === 'WebApplication' ? 'tool' : page.type === 'Article' ? 'guide' : page.type === 'CollectionPage' && page.topic ? 'topic' : 'page'}">${parts.join('\n')}</div>`;
}

function renderPage(page) {
  let html = baseHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*\/>/, meta('description', page.description));
  html = html.replace(/<meta property="og:title"[^>]*\/>/, meta('og:title', page.title, true));
  html = html.replace(/<meta property="og:description"[^>]*\/>/, meta('og:description', page.description, true));
  html = html.replace(/<meta property="og:type"[^>]*\/>/, meta('og:type', page.ogType || (page.type === 'Article' ? 'article' : 'website'), true));
  html = html.replace(/<meta property="og:image"[^>]*\/>/, meta('og:image', ogImage, true));
  html = html.replace(/<meta name="robots"[^>]*\/>/, meta('robots', page.robots || 'index, follow, max-image-preview:large'));
  html = html.replace('</head>', `${meta('og:image:alt', 'QuicGen — free privacy-first online tools', true)}\n    ${meta('twitter:image:alt', 'QuicGen — free privacy-first online tools')}\n  </head>`);
  html = html.replace(/<meta name="twitter:title"[^>]*\/>/, meta('twitter:title', page.title));
  html = html.replace(/<meta name="twitter:description"[^>]*\/>/, meta('twitter:description', page.description));
  html = html.replace(/<meta name="twitter:card"[^>]*\/>/, meta('twitter:card', 'summary_large_image'));
  const twitterImage = meta('twitter:image', ogImage);
  if (html.includes('</head>')) html = html.replace('</head>', `${meta('og:url', `${siteUrl}${page.path}`, true)}\n    <link rel="canonical" href="${escapeHtml(`${siteUrl}${page.path}`)}" />\n    ${twitterImage}\n    <script id="qg-structured-data" type="application/ld+json">${JSON.stringify(schemaFor(page)).replaceAll('<', '\\u003c')}</script>\n  </head>`);
  if (html.includes('<div id="root">')) html = html.replace('<div id="root">', `<div id="root">${prerenderedBody(page)}`);
  return html;
}

for (const page of pages) {
  const directory = page.path === '/' ? out : join(out, page.path.slice(1));
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), renderPage(page));
}
const notFound = renderPage({ path: '/not-found', title: 'Page Not Found | QuicGen', description: 'We could not find that page. Return to QuicGen to explore our free, private online tools.', type: 'WebPage', robots: 'noindex, follow' });
writeFileSync(join(out, '404.html'), notFound);

const urls = pages.map((page) => `  <url><loc>${escapeHtml(`${siteUrl}${page.path}`)}</loc><changefreq>${page.path === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${page.path === '/' ? '1.0' : page.type === 'WebApplication' ? '0.8' : '0.5'}</priority></url>`).join('\n');
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
// Cloudflare Workers static assets parses this file during `wrangler deploy`
// and only accepts the status codes 200 (proxy/rewrite), 301, 302 (default),
// 303, 307 or 308. The Netlify-only `!` force flag and non-redirect codes such
// as 404 are rejected by the Cloudflare API at deploy time. Unknown routes are
// handled by the SPA fallback configured for the Workers deployment, which
// serves the app shell so React Router renders the custom not-found page.
const routeRedirects = pages.filter((page) => page.path !== '/').map((page) => `${page.path} ${page.path}/index.html 200`);
writeFileSync(join(out, '_redirects'), `${routeRedirects.join('\n')}\n`);
console.log(`Generated SEO metadata and sitemap for ${pages.length} routes at ${siteUrl}`);

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { md5, sha1 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

const dist = join(process.cwd(), 'dist');
const guideEntries = JSON.parse(readFileSync(join(process.cwd(), 'src/data/guides.json'), 'utf8'));
const topicEntries = JSON.parse(readFileSync(join(process.cwd(), 'src/data/topics.json'), 'utf8'));
const articlePaths = guideEntries.map((guide) => `/blog/${guide.slug}`);
const topicPaths = topicEntries.map((topic) => `/topics/${topic.slug}`);
const paths = [
  '/', '/qr-code-generator', '/password-generator', '/uuid-generator', '/random-number-generator',
  '/random-string-generator', '/random-color-generator', '/dice-roller', '/percentage-calculator',
  '/tip-calculator', '/time-calculator', '/date-calculator', '/word-counter', '/case-converter',
  '/lorem-ipsum-generator', '/color-picker', '/base64-encoder-decoder', '/hash-generator',
  '/about', '/privacy', '/help', '/blog', '/topics', ...articlePaths, ...topicPaths,
];
const titles = new Set();
const descriptions = new Set();
for (const route of paths) {
  const file = route === '/' ? join(dist, 'index.html') : join(dist, route.slice(1), 'index.html');
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="(.*?)"\s*\/>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="(.*?)"\s*\/>/)?.[1];
  assert.ok(title, `${route} has a title`);
  assert.ok(description, `${route} has a meta description`);
  assert.ok(canonical, `${route} has a canonical URL`);
  assert.ok(html.includes('property="og:title"'), `${route} has Open Graph metadata`);
  assert.ok(html.includes('name="twitter:card"'), `${route} has Twitter metadata`);
  assert.ok(html.includes('property="og:url"'), `${route} has an Open Graph URL`);
  assert.ok(html.includes('name="twitter:image"'), `${route} has a Twitter image`);
  assert.ok(html.includes('id="qg-structured-data"'), `${route} has structured data`);
  const ogUrl = html.match(/property="og:url" content="(.*?)"\s*\/>/)?.[1];
  assert.equal(ogUrl, canonical, `${route} Open Graph URL matches its canonical URL`);
  assert.ok(!titles.has(title), `title is unique: ${route}`);
  assert.ok(!descriptions.has(description), `description is unique: ${route}`);
  titles.add(title);
  descriptions.add(description);
}

const guideSupplement = JSON.parse(readFileSync(join(process.cwd(), 'src/data/guide-supplement.json'), 'utf8'));
const articleFields = ['opening', 'purpose', 'steps', 'examples', 'choices', 'tips', 'troubleshooting', 'privacyNote', 'faqs', 'closing'];
function stringValues(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringValues);
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringValues);
  return [];
}
for (const guide of guideEntries) {
  const articleText = [
    ...articleFields.flatMap((field) => stringValues(guide[field] ?? '')),
    ...guideSupplement.shared.map((section) => section.body),
    guideSupplement.families[guide.family].body,
  ].join(' ');
  const articleWordCount = articleText.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  assert.ok(articleWordCount >= 1200, `${guide.slug} includes at least 1,200 useful guide words (found ${articleWordCount})`);
  const routeHtml = readFileSync(join(dist, 'blog', guide.slug, 'index.html'), 'utf8');
  const schema = routeHtml.match(/<script id="qg-structured-data"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
  assert.ok(schema.includes('"@type":"Article"'), `${guide.slug} has Article structured data`);
  assert.ok(schema.includes('"@type":"HowTo"'), `${guide.slug} has HowTo structured data`);
  assert.ok(schema.includes('"@type":"FAQPage"'), `${guide.slug} has FAQ structured data`);
  assert.match(routeHtml, /property="og:type" content="article"\s*\/>/, `${guide.slug} is tagged as an Open Graph article`);
}
const knownToolSlugs = new Set(paths.slice(1, 18).map((route) => route.slice(1)));
const knownGuideSlugs = new Set(guideEntries.map((guide) => guide.slug));
const guidesByToolSlug = new Set(guideEntries.map((guide) => guide.toolSlug));
assert.equal(guidesByToolSlug.size, knownToolSlugs.size, 'every tool has exactly one dedicated guide');
for (const slug of knownToolSlugs) assert.ok(guidesByToolSlug.has(slug), `${slug} has a dedicated tool guide`);
for (const topic of topicEntries) {
  for (const slug of topic.toolSlugs) assert.ok(knownToolSlugs.has(slug), `${topic.slug} references an existing tool: ${slug}`);
  for (const slug of topic.guideSlugs) assert.ok(knownGuideSlugs.has(slug), `${topic.slug} references an existing guide: ${slug}`);
  const routeHtml = readFileSync(join(dist, 'topics', topic.slug, 'index.html'), 'utf8');
  const schema = routeHtml.match(/<script id="qg-structured-data"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
  assert.ok(schema.includes('"@type":"CollectionPage"'), `${topic.slug} has CollectionPage structured data`);
  assert.ok(schema.includes('"@type":"FAQPage"'), `${topic.slug} has FAQ structured data`);
}
for (const route of paths.slice(1, 18)) {
  const routeHtml = readFileSync(join(dist, route.slice(1), 'index.html'), 'utf8');
  const schema = routeHtml.match(/<script id="qg-structured-data"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
  assert.ok(schema.includes('"@type":"WebApplication"'), `${route} has WebApplication structured data`);
  assert.ok(schema.includes('"@type":"FAQPage"'), `${route} has FAQ structured data`);
}

// Tool page content depth: every tool needs unique explanatory copy, practical
// steps and 3–5 of its own FAQs (300–600 useful words per page).
const toolContentEntries = JSON.parse(readFileSync(join(process.cwd(), 'src/data/tool-content.json'), 'utf8'));
const escapeSeoHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const countWords = (value) => value.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
const seenFaqAnswers = new Set();
for (const route of paths.slice(1, 18)) {
  const slug = route.slice(1);
  const content = toolContentEntries[slug];
  assert.ok(content, `${slug} has a tool content entry`);
  assert.ok(content.about.length >= 2 && content.about.length <= 3, `${slug} explains itself in 2–3 paragraphs`);
  assert.ok(content.howTo.length >= 3, `${slug} has at least 3 practical how-to steps`);
  assert.ok(content.faqs.length >= 3 && content.faqs.length <= 5, `${slug} has 3–5 of its own FAQs`);
  const uniqueWords = countWords(content.intro)
    + content.howTo.reduce((total, step) => total + countWords(step), 0)
    + content.about.reduce((total, paragraph) => total + countWords(paragraph), 0)
    + content.faqs.reduce((total, faq) => total + countWords(faq.question) + countWords(faq.answer), 0);
  assert.ok(uniqueWords >= 300 && uniqueWords <= 600, `${slug} carries 300–600 useful words of unique copy (found ${uniqueWords})`);
  for (const faq of content.faqs) {
    assert.ok(!seenFaqAnswers.has(faq.answer), `${slug} FAQ answer is unique: ${faq.question}`);
    seenFaqAnswers.add(faq.answer);
  }
  const routeHtml = readFileSync(join(dist, slug, 'index.html'), 'utf8');
  assert.ok(routeHtml.includes('data-prerendered="tool"'), `${slug} prerenders its content block for crawlers`);
  assert.ok(routeHtml.includes(escapeSeoHtml(content.about[0])), `${slug} prerenders its unique “what this tool does” copy`);
  assert.ok(routeHtml.includes(escapeSeoHtml(content.faqs[0].question)), `${slug} prerenders its unique FAQs`);
  assert.ok(routeHtml.includes(escapeSeoHtml(content.howTo[0])), `${slug} prerenders its how-to steps`);
  const schema = routeHtml.match(/<script id="qg-structured-data"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
  assert.ok(schema.includes('"@type":"HowTo"'), `${slug} has HowTo structured data`);
  assert.ok(schema.includes(content.faqs[0].question), `${slug} FAQ schema uses its unique questions`);
  assert.ok(!schema.includes('Is my input uploaded or saved?'), `${slug} FAQ schema is not the generic template`);
}
const homeHtmlForTools = readFileSync(join(dist, 'index.html'), 'utf8');
for (const route of paths.slice(1, 18)) {
  assert.ok(homeHtmlForTools.includes(`${route}"`), `home page links to ${route}`);
}

// Ad slots are present and clearly reserved, but no ad network may load yet.
const assetBundle = readdirSync(join(dist, 'assets')).filter((file) => file.endsWith('.js')).map((file) => readFileSync(join(dist, 'assets', file), 'utf8')).join('\n');
assert.ok(assetBundle.includes('data-ad-placement'), 'ad placement zones are rendered on tool pages');
assert.ok(assetBundle.includes('ad-slot-frame'), 'ad zones keep their reserved frames');
for (const forbidden of ['googlesyndication', 'adsbygoogle', 'pagead2', 'ethicalads', 'carbonads', 'buysellads', 'doubleclick.net']) {
  assert.ok(!assetBundle.toLowerCase().includes(forbidden), `no ${forbidden} scripts are bundled yet`);
}

const homeHtml = readFileSync(join(dist, 'index.html'), 'utf8');
const canonicalHome = homeHtml.match(/<link rel="canonical" href="(.*?)"\s*\/>/)?.[1];
assert.ok(canonicalHome, 'home page has a canonical URL');
const siteUrl = new URL(canonicalHome).origin;
let configuredSiteUrl = process.env.VITE_SITE_URL || '';
if (!configuredSiteUrl) {
  for (const file of ['.env.production.local', '.env.local', '.env.production', '.env']) {
    try {
      const match = readFileSync(join(process.cwd(), file), 'utf8').match(/^\s*VITE_SITE_URL\s*=\s*(.+?)\s*$/m);
      if (match) { configuredSiteUrl = match[1].replace(/^['\"]|['\"]$/g, '').trim(); break; }
    } catch { /* No local environment file. */ }
  }
}
assert.equal(siteUrl, new URL(configuredSiteUrl || 'https://quicgen.nnamdimichael020.workers.dev').origin, 'canonical origin matches the live default or explicit deployment domain');
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
for (const route of paths) assert.ok(sitemap.includes(`${siteUrl}${route === '/' ? '/' : route}`), `sitemap includes ${route}`);
assert.ok(readFileSync(join(dist, 'robots.txt'), 'utf8').includes(`Sitemap: ${siteUrl}/sitemap.xml`));
const redirects = readFileSync(join(dist, '_redirects'), 'utf8');
const redirectLines = redirects.split('\n').filter((line) => line.trim() !== '' && !line.trim().startsWith('#'));
assert.equal(redirectLines.length, paths.length - 1, '_redirects has one rewrite per non-home route');
const CLOUDFLARE_REDIRECT_CODES = new Set(['200', '301', '302', '303', '307', '308']);
for (const line of redirectLines) {
  const parts = line.trim().split(/\s+/);
  assert.equal(parts.length, 3, `redirect rule uses source, destination and status code: ${line}`);
  assert.ok(!line.includes('!'), `redirect rule has no Netlify-only force flag: ${line}`);
  assert.ok(CLOUDFLARE_REDIRECT_CODES.has(parts[2]), `redirect status code is Cloudflare-compatible: ${line}`);
}
assert.ok(redirects.includes('/qr-code-generator /qr-code-generator/index.html 200'), '_redirects keeps clean tool URLs with 200 rewrites');
assert.ok(!redirects.includes('404'), '_redirects does not use the unsupported 404 status');
const vercel = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'));
for (const source of ['/blog/:slug', '/topics', '/topics/:slug']) assert.ok(vercel.rewrites.some((rewrite) => rewrite.source === source), `Vercel has a clean route rewrite for ${source}`);
const manifest = JSON.parse(readFileSync(join(dist, 'site.webmanifest'), 'utf8'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192' && icon.type === 'image/png'), 'install manifest has a 192px PNG icon');
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.type === 'image/png'), 'install manifest has a 512px PNG icon');
for (const icon of manifest.icons) readFileSync(join(dist, icon.src.startsWith('/') ? icon.src.slice(1) : icon.src));

// wrangler is pinned as a devDependency so Cloudflare CI's `npx wrangler deploy`
// always runs the exact version the site was verified with.
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
assert.ok(/^\d+\.\d+\.\d+$/.test(packageJson.devDependencies?.wrangler ?? ''), 'wrangler is pinned to an exact version');
assert.match(readFileSync(join(dist, '404.html'), 'utf8'), /name="robots" content="noindex, follow"/);

const bytes = new TextEncoder().encode('abc');
assert.equal(bytesToHex(md5(bytes)), '900150983cd24fb0d6963f7d28e17f72');
assert.equal(bytesToHex(sha1(bytes)), 'a9993e364706816aba3e25717850c26c9cd0d89d');
assert.equal(bytesToHex(sha256(bytes)), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
console.log(`Smoke tests passed: ${paths.length} route metadata sets, ${guideEntries.length} long-form guide routes, ${topicEntries.length} linked topic collections, ${Object.keys(toolContentEntries).length} tool content depth checks (300–600 unique words, unique FAQs, prerendered copy), reserved ad slots without ad networks, sitemap/canonical origin, Cloudflare and Vercel rewrites, install manifest, pinned wrangler, 404 policy, and hash vectors.`);

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { md5, sha1 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

const dist = join(process.cwd(), 'dist');
const paths = [
  '/', '/qr-code-generator', '/password-generator', '/uuid-generator', '/random-number-generator',
  '/random-string-generator', '/random-color-generator', '/dice-roller', '/percentage-calculator',
  '/tip-calculator', '/time-calculator', '/date-calculator', '/word-counter', '/case-converter',
  '/lorem-ipsum-generator', '/color-picker', '/base64-encoder-decoder', '/hash-generator',
  '/about', '/privacy', '/help', '/blog',
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
  assert.ok(html.includes('id="qg-structured-data"'), `${route} has structured data`);
  assert.ok(!titles.has(title), `title is unique: ${route}`);
  assert.ok(!descriptions.has(description), `description is unique: ${route}`);
  titles.add(title);
  descriptions.add(description);
}

const homeHtml = readFileSync(join(dist, 'index.html'), 'utf8');
const canonicalHome = homeHtml.match(/<link rel="canonical" href="(.*?)"\s*\/>/)?.[1];
assert.ok(canonicalHome, 'home page has a canonical URL');
const siteUrl = new URL(canonicalHome).origin;
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

// wrangler is pinned as a devDependency so Cloudflare CI's `npx wrangler deploy`
// always runs the exact version the site was verified with.
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
assert.ok(/^\d+\.\d+\.\d+$/.test(packageJson.devDependencies?.wrangler ?? ''), 'wrangler is pinned to an exact version');
assert.match(readFileSync(join(dist, '404.html'), 'utf8'), /name="robots" content="noindex, follow"/);

const bytes = new TextEncoder().encode('abc');
assert.equal(bytesToHex(md5(bytes)), '900150983cd24fb0d6963f7d28e17f72');
assert.equal(bytesToHex(sha1(bytes)), 'a9993e364706816aba3e25717850c26c9cd0d89d');
assert.equal(bytesToHex(sha256(bytes)), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
console.log(`Smoke tests passed: ${paths.length} route metadata sets, sitemap, Cloudflare-compatible redirects, pinned wrangler, 404 policy, and hash vectors.`);

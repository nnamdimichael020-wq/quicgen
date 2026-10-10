// Renders every route to HTML strings in Vite's SSR pipeline to catch render
// crashes and missing content blocks before they reach the browser.
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const vite = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { renderRoute, routeList, tools } = await vite.ssrLoadModule('/scripts/render-check-entry.tsx');
  const routes = routeList();
  for (const route of routes) {
    const html = renderRoute(route);
    assert.ok(html.length > 500, `${route} renders real markup (${html.length} chars)`);
    assert.ok(!html.includes('undefined'), `${route} does not render "undefined" placeholders`);
  }
  for (const tool of tools) {
    const html = renderRoute(`/${tool.slug}`);
    assert.ok(html.includes('What the'), `${tool.slug} renders its “what this tool does” section`);
    assert.ok(html.includes('How to use the'), `${tool.slug} renders its how-to steps`);
    assert.ok(html.includes('Frequently asked questions'), `${tool.slug} renders its FAQ`);
    assert.ok(html.includes('Related guides'), `${tool.slug} links related guides`);
    assert.ok(html.includes('Related tools'), `${tool.slug} links related tools`);
    assert.ok(html.includes('data-ad-placement="tool-below"'), `${tool.slug} reserves the below-tool ad zone`);
    assert.ok(html.includes('data-ad-placement="tool-inline"'), `${tool.slug} reserves the in-content ad zone`);
    assert.ok(html.includes('Advertisement'), `${tool.slug} labels its ad zones`);
  }
  console.log(`Render checks passed: ${routes.length} routes rendered with content blocks, FAQs, internal links and reserved ad zones.`);
} finally {
  await vite.close();
}

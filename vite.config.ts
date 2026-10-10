import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serve the prerendered route folders in `vite preview` the same way the
 * production hosts do (`_redirects` on Cloudflare Workers, `vercel.json`
 * rewrites on Vercel), so a preview deep link shows its own metadata and
 * content instead of falling back to the SPA shell.
 */
function prerenderedRoutes(): Plugin {
  return {
    name: 'prerendered-routes',
    configurePreviewServer(server) {
      const outDir = resolve(server.config.root, server.config.build.outDir);
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '').split('?');
        if (path && path !== '/' && !path.split('/').pop()?.includes('.')) {
          const candidate = join(outDir, path.slice(1), 'index.html');
          if (existsSync(candidate)) req.url = `${path}/index.html${query ? `?${query}` : ''}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), prerenderedRoutes()],
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
});

import { mysteryRoutes } from './src/catalog/mysteries.js';
import { creations } from './src/catalog/creations.js';
import { defineConfig } from 'vite';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sections } from './src/catalog/registry.js';
import { personalPages } from './src/catalog/personal.js';
import { tools } from './src/catalog/tools.js';
import { experiences } from './src/catalog/experiences.js';
import { manifest, safePath } from './scripts/legacy.mjs';
import { repoRoot, siteRoot, distRoot } from './scripts/paths.mjs';
import { mimeTypes } from './scripts/server.mjs';

function legacyDevFiles() {
  const allowed = new Set(manifest.files.filter((file) => file.path !== 'index.html').map((file) => `/${file.path}`));
  return {
    name: 'explicit-legacy-dev-files',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = new URL(req.url, 'http://localhost').pathname;
        const legacyPath = path === '/' ? '/index.html' : path;
        if (!allowed.has(legacyPath)) return next();
        try {
          const bytes = await readFile(safePath(repoRoot, legacyPath.slice(1)));
          res.setHeader('Content-Type', mimeTypes[legacyPath.split('.').at(-1)] || 'application/octet-stream');
          res.end(bytes);
        } catch (error) { next(error); }
      });
    },
  };
}

export default defineConfig({
  root: siteRoot,
  publicDir: false,
  appType: 'mpa',
  base: './',
  resolve: { alias: { '/src': resolve(repoRoot, 'src') } },
  plugins: [legacyDevFiles()],
  server: { host: '127.0.0.1', fs: { allow: [repoRoot] } },
  build: {
    modulePreload: { polyfill: false },
    outDir: distRoot,
    emptyOutDir: true,
    assetsDir: 'katovia-assets',
    target: ['es2022', 'safari16'],
    rolldownOptions: {
      output: { postBanner: '/*! Vite preload helper: Copyright (c) 2019-present VoidZero Inc. and Vite contributors. MIT; license: /katovia-assets/vite-runtime-LICENSE.txt */' },
      input: [...mysteryRoutes.map(route => resolve(siteRoot, `${route.slice(1)}index.html`)), resolve(siteRoot, 'index.html'), ...sections.map((section) => resolve(siteRoot, `${section.id}/index.html`)), ...[...experiences,...tools,...personalPages,...creations].map((entry) => resolve(siteRoot, `${entry.route.slice(1)}index.html`)), resolve(siteRoot, 'v2/index.html'), ...sections.map((section) => resolve(siteRoot, `v2/${section.id}/index.html`)), resolve(siteRoot, '404.html')],
    },
  },
});

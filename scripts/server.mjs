import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

export const mimeTypes = { xml:'application/xml; charset=utf-8', html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json; charset=utf-8', jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', txt: 'text/plain; charset=utf-8' };

// Plain static serving: no history fallback. Used by preview and direct-route QA.
export function createStaticServer(root) {
  return createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const path = resolve(root, `.${pathname}`);
      const rel = relative(root, path);
      if (rel.startsWith('..') || isAbsolute(rel) || rel.split(/[\\/]/).some((part) => part.startsWith('.'))) { res.writeHead(404); return res.end(); }
      let file = path;
      const info = await stat(path).catch(() => null);
      if (info?.isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(301, { Location: `${pathname}/${new URL(req.url, 'http://localhost').search}` }); return res.end(); }
        file = resolve(path, 'index.html');
      }
      const bytes = await readFile(file).catch(() => null);
      if (!bytes) {
        const page = await readFile(resolve(root, '404.html')).catch(() => Buffer.from('Not found'));
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(req.method === 'HEAD' ? undefined : page);
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[file.split('.').at(-1)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(400); res.end('Bad request'); }
  });
}

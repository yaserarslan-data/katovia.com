import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sections } from '../src/catalog/registry.js';
import { manifest, checkLegacy } from './legacy.mjs';
import { distRoot } from './paths.mjs';

export async function artifactFiles(root = distRoot, prefix = '') {
  const result = [];
  for (const entry of await readdir(resolve(root, prefix), { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) result.push(...await artifactFiles(root, name));
    else if (entry.isFile()) result.push(name);
    else throw new Error(`Unexpected artifact entry: ${name}`);
  }
  return result;
}
export async function checkArtifact() {
  const counts = await checkLegacy(distRoot, { rootCutover: true });
  const htmlEntries = ['index.html', ...sections.map((item) => `${item.id}/index.html`), 'v2/index.html', ...sections.map((item) => `v2/${item.id}/index.html`), '404.html'];
  const allowed = new Set([...manifest.files.map((file) => file.path), ...htmlEntries]);
  for (const name of await artifactFiles()) {
    if (!allowed.has(name) && !/^katovia-assets\/[a-zA-Z0-9_-]+\.(js|css)$/.test(name)) throw new Error(`Unexpected file leaked into artifact: ${name}`);
  }
  for (const name of htmlEntries) {
    const html = await readFile(resolve(distRoot, name), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      if (/^https?:/.test(match[1]) || match[1] === '/') continue;
      const target = match[1].split('#')[0];
      const path = target.startsWith('/') ? resolve(distRoot, `.${target}`) : resolve(distRoot, name, '..', target);
      await readFile(match[1].endsWith('/') ? resolve(path, 'index.html') : path);
    }
  }
  return counts;
}
if (process.argv[1]?.endsWith('check-artifact.mjs')) console.log('Artifact outputs, local links and publication allowlist verified:', await checkArtifact());

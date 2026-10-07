import { mkdir, copyFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { manifest, checkLegacy, safePath } from './legacy.mjs';
import { repoRoot, distRoot, siteRoot } from './paths.mjs';

// Validate every source before copying anything. Never copy the repository root.
await checkLegacy();
for (const file of manifest.files) {
  if (file.path === 'index.html') continue; // Explicit root cutover exception; source remains retained.
  const destination = safePath(distRoot, file.path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(safePath(repoRoot, file.path), destination);
}
console.log('Legacy preserved byte-for-byte:', await checkLegacy(distRoot, { rootCutover: true }));
for(const name of ['sitemap.xml','robots.txt'])await copyFile(safePath(siteRoot,name),safePath(distRoot,name));
await copyFile(new URL('../src/build/vite-runtime-license.txt',import.meta.url),safePath(distRoot,'katovia-assets/vite-runtime-LICENSE.txt'));

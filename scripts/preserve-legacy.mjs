import { mkdir, copyFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { manifest, checkLegacy, safePath } from './legacy.mjs';
import { repoRoot, distRoot } from './paths.mjs';

// Validate every source before copying anything. Never copy the repository root.
await checkLegacy();
for (const file of manifest.files) {
  const destination = safePath(distRoot, file.path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(safePath(repoRoot, file.path), destination);
}
console.log('Legacy preserved byte-for-byte:', await checkLegacy(distRoot));

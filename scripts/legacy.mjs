import { readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, isAbsolute } from 'node:path';
import { repoRoot } from './paths.mjs';

export const manifest = JSON.parse(await readFile(new URL('./legacy-manifest.json', import.meta.url), 'utf8'));
export function safePath(root, path) {
  if (!path || path.includes('\\') || path.split('/').some((part) => !part || part === '.' || part === '..')) throw new Error(`Invalid allowlist path: ${path}`);
  const result = resolve(root, path);
  const rel = relative(root, result);
  if (isAbsolute(path) || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Path escaped allowed directory');
  return result;
}
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function checkLegacy(root = repoRoot, { rootCutover = false } = {}) {
  const counts = {};
  const seen = new Set();
  for (const file of manifest.files) {
    if (rootCutover && file.path === 'index.html') continue; // Only the authorized showcase replacement.
    if (seen.has(file.path)) throw new Error('Duplicate manifest path');
    seen.add(file.path);
    const path = safePath(root, file.path);
    if (!(await lstat(path)).isFile()) throw new Error(`Legacy entry is not a regular file: ${file.path}`);
    const bytes = await readFile(path);
    if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) throw new Error(`Legacy changed: ${file.path}. Review before updating the preservation manifest.`);
    counts[file.category] = (counts[file.category] || 0) + 1;
  }
  return counts;
}

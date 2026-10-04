import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
export const repoRoot = fileURLToPath(new URL('../', import.meta.url));
export const siteRoot = resolve(repoRoot, 'site');
export const distRoot = resolve(repoRoot, 'dist');

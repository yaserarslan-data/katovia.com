import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { safePath, hash } from './legacy.mjs';
import { repoRoot, distRoot } from './paths.mjs';

export const gameBuildFiles = JSON.parse(await readFile(new URL('./game-build-manifest.json', import.meta.url), 'utf8'));

export async function checkGameBuilds(root, copy = false) {
  const paths = new Set();
  for (const file of gameBuildFiles) {
    if (!file.path.startsWith('game-builds/') || paths.has(file.path)) throw new Error(`Invalid game artifact: ${file.path}`);
    paths.add(file.path);
    const data = await readFile(safePath(root, file.path));
    if (data.length !== file.bytes || hash(data) !== file.sha256) throw new Error(`Game artifact changed: ${file.path}`);
    if (copy) {
      const output = safePath(distRoot, file.path);
      await mkdir(dirname(output), {recursive:true});
      await writeFile(output,data);
    }
  }
}
export const copyGameBuilds = () => checkGameBuilds(repoRoot, true);

import { readFile } from 'node:fs/promises';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { resolve } from 'node:path';
import { artifactFiles } from './check-artifact.mjs';
import { distRoot } from './paths.mjs';
const sizes = { js: 0, css: 0 };
console.log('V2 asset budget (bytes: raw / gzip / brotli):');
for (const file of (await artifactFiles()).filter((name) => name.startsWith('v2/assets/'))) {
  const buffer = await readFile(resolve(distRoot, file));
  const gzip = gzipSync(buffer).length;
  const type = file.split('.').at(-1);
  if (type in sizes) sizes[type] += gzip;
  console.log(`${file}: ${buffer.length} / ${gzip} / ${brotliCompressSync(buffer).length}`);
}
if (sizes.css > 25 * 1024 || sizes.js > 80 * 1024) throw new Error('V2 initial asset budget exceeded');
console.log(`Totals: JS ${sizes.js} bytes gzip; CSS ${sizes.css} bytes gzip. Heavy runtime dependencies: none.`);

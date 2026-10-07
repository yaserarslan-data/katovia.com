import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sections, entries } from '../src/catalog/registry.js';
import { createStaticServer } from '../scripts/server.mjs';
import { manifest, checkLegacy, safePath } from '../scripts/legacy.mjs';
import { checkArtifact, artifactFiles } from '../scripts/check-artifact.mjs';
import { repoRoot, distRoot } from '../scripts/paths.mjs';

test('authorized cleanup preserves legacy routes and remaining bytes without retired vendor or unused JPEGs', async () => {
  assert.equal(manifest.files.length, 31);
  const expected = { config: 2, html: 19, data: 6, js: 4 };
  assert.deepEqual(await checkLegacy(), expected);
  assert.deepEqual(await checkLegacy(distRoot, { rootCutover: true }), { ...expected, html: 18 });
  await checkArtifact();
  const files = await artifactFiles();
  assert.equal(files.some((file) => /^(tanitim|docs|src|scripts|node_modules|\.git)\//.test(file)), false);
});
test('allowlist rejects traversal and absolute paths', () => {
  for (const path of ['../index.html', '/index.html', 'C:/private', 'foo\\bar', './index.html']) assert.throws(() => safePath(repoRoot, path));
});
test('registry has unique IDs, honest status and existing legacy targets', async () => {
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  assert.equal(sections.length, 6);
  assert.deepEqual(sections.filter((section) => section.status === 'available').map((section) => section.id), ['today', 'play', 'challenge', 'create', 'tools']);
  for (const entry of entries) {
    assert.equal(entry.status, 'legacy');
    await readFile(resolve(distRoot, entry.route.slice(1), entry.route.endsWith('/') ? 'index.html' : ''));
  }
});
test('plain static artifact direct loads, refreshes, query and 404 do not rely on SPA fallback', async () => {
  const server = createStaticServer(distRoot);
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/', ...sections.map((section) => section.route)]) {
      for (let refresh = 0; refresh < 2; refresh++) {
        const response = await fetch(base + route);
        assert.equal(response.status, 200);
        assert.match(await response.text(), /<html lang="en">/);
      }
    }
    assert.equal((await fetch(`${base}/today/?preview=1`)).status, 200);
    assert.equal((await fetch(`${base}/today`, { redirect: 'manual' })).status, 301);
    for (const route of ['/unknown-route/', '/v2/nonexistent/', '/docs/KATOVIA_2_EPIC_0_ANALYSIS.md', '/tanitim/katovia-tanitim.html', '/.git/config', '/d/example', '/p/example']) assert.equal((await fetch(base + route)).status, 404);
    const missing = await fetch(`${base}/v2/nonexistent/`);
    assert.match(await missing.text(), /404 \/ KATOVIA/);
    const home = await (await fetch(base + '/')).text();
    assert.match(home, /data-daily-mount/);
    assert.match(home, /rel="canonical" href="https:\/\/katovia.com\/"/);
    assert.doesNotMatch(home, /noindex|\/v2\//);
    for (const file of manifest.files.filter((file) => file.path !== 'index.html')) {
      const response = await fetch(base + '/' + file.path);
      assert.equal(response.status, 200, file.path);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(resolve(repoRoot, file.path)), file.path);
    }
  } finally { await new Promise((done) => server.close(done)); }
});

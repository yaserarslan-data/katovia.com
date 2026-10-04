import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../src/core/storage.js';
import { sanitizeEvent, track } from '../src/core/analytics.js';
import { reportError } from '../src/core/errors.js';
import { createTextPayload, copyText, shareText, supportsWebShare } from '../src/core/share.js';

const memory = () => {
  const data = new Map();
  return { data, getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
};
test('storage missing/malformed/version mismatch use fallback without corrupting legacy', () => {
  const backend = memory();
  const store = createStorage({ getBackend: () => backend });
  const fallback = { score: null };
  assert.equal(store.get('missing', fallback), fallback);
  for (const value of ['{broken', 'null', 'false', '[]', '{"value":1}', '{"version":2,"value":1}']) {
    backend.setItem('katovia:v2:result', value);
    assert.equal(store.get('result', fallback), fallback);
  }
  backend.setItem('legacy-score', '99');
  assert.equal(store.set('result', { score: 0 }), true);
  assert.deepEqual(store.get('result'), { score: 0 });
  assert.equal(backend.getItem('legacy-score'), '99');
  assert.equal(store.remove('result'), true);
  assert.equal(store.get('result'), null);
});
test('storage handles denied accessor, unavailable backend and quota failures', () => {
  for (const getBackend of [() => { throw new Error('SecurityError'); }, () => undefined, () => ({ getItem() { throw new Error('Denied'); }, setItem() { throw new Error('QuotaExceededError'); }, removeItem() { throw new Error('Denied'); } })]) {
    const store = createStorage({ getBackend });
    assert.equal(store.get('x', 'safe'), 'safe');
    assert.equal(store.set('x', 1), false);
    assert.equal(store.remove('x'), false);
  }
});
test('storage rejects values JSON cannot encode', () => {
  const store = createStorage({ getBackend: memory });
  const circular = {}; circular.self = circular;
  for (const value of [undefined, circular, 1n]) assert.equal(store.set('x', value), false);
});
test('analytics ignores PII, raw URLs, free text and unknown events', () => {
  assert.deepEqual(sanitizeEvent('home_view', { route_key: 'home', email: 'person@example.org', url: 'https://example.org/private', score_bucket: 3, title: 'Personal quiz', channel: 'email' }), { eventName: 'home_view', payload: { route_key: 'home', score_bucket: 3 } });
  assert.equal(track('unknown', {}), false);
  assert.equal(track('home_view', {}), true);
  assert.deepEqual(sanitizeEvent('share_completed', { outcome: 'handoff', channel: 'native', duration_bucket: -1 }), { eventName: 'share_completed', payload: { outcome: 'handoff', channel: 'native' } });
});
test('share input validates protocol, credentials and payload size', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,a', 'https://name:secret@example.org/', '/relative']) assert.throws(() => createTextPayload({ url }));
  assert.throws(() => createTextPayload({ text: 'a'.repeat(4001) }));
  assert.deepEqual(createTextPayload({ text: 'KATOVIA #001', url: 'https://katovia.com/v2/today/' }), { title: 'Katovia', text: 'KATOVIA #001', url: 'https://katovia.com/v2/today/' });
});
test('native share handoff and cancellation are distinct; cancellation does not copy', async () => {
  assert.equal(supportsWebShare({}), false);
  assert.deepEqual(await shareText({ text: 'result' }, { share: async () => {} }), { status: 'handoff' });
  let copied = false;
  assert.deepEqual(await shareText({ text: 'result' }, { share: async () => { const error = new Error(); error.name = 'AbortError'; throw error; }, clipboard: { writeText: async () => { copied = true; } } }), { status: 'cancelled' });
  assert.equal(copied, false);
});
test('failed/unsupported share falls back to clipboard or selectable text', async () => {
  let text;
  assert.deepEqual(await shareText({ text: 'result', url: 'https://katovia.com/' }, { share: async () => { throw new Error('Denied'); }, clipboard: { writeText: async (value) => { text = value; } } }), { status: 'copied' });
  assert.equal(text, 'result\nhttps://katovia.com/');
  assert.deepEqual(await copyText('result', {}), { status: 'manual', text: 'result' });
  assert.deepEqual(await copyText('result', { clipboard: { writeText: async () => { throw new Error(); } } }), { status: 'manual', text: 'result' });
});
test('error UI uses text content and logs no private error payload', () => {
  const target = { dataset: {} }; const messages = [];
  assert.equal(reportError('storage_denied', { target, debug: true, logger: { warn: (message) => messages.push(message) } }), 'storage_denied');
  assert.equal(target.dataset.state, 'error');
  assert.equal(messages[0], '[Katovia] storage_denied');
  assert.equal(reportError('https://private.example/'), 'unexpected_error');
});

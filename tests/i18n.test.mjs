import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createI18n, detectLocale, translate } from '../src/i18n/index.js';
import { messages } from '../src/i18n/messages.js';
import { createStorage } from '../src/core/storage.js';
import { resultShare } from '../src/games/stop-at-five/share.js';
import { readFile } from 'node:fs/promises';
import { sections } from '../src/catalog/registry.js';

test('locale detection respects valid preference, Turkish browser and English fallback', () => {
  assert.equal(detectLocale(null), 'en');
  for (const value of ['tr', 'tr-TR', 'TR-tr']) assert.equal(detectLocale(null, value), 'tr');
  for (const value of ['en-US', 'de-DE', '', 'trash']) assert.equal(detectLocale(null, value), 'en');
  assert.equal(detectLocale('en', 'tr-TR'), 'en');
  assert.equal(detectLocale('tr', 'en-US'), 'tr');
  assert.equal(detectLocale('bad', 'tr'), 'tr');
});
test('switch persistence uses safe versioned adapter; unavailable storage stays usable', () => {
  const values = new Map();
  const backend = createStorage({ getBackend: () => ({ getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) }) });
  const first = createI18n({ backend, browserLanguage: 'en' });
  const updates = []; const remove = first.subscribe((locale) => updates.push(locale));
  first.setLocale('tr'); assert.equal(first.t('nav.play'), 'OYNA');
  assert.equal(createI18n({ backend, browserLanguage: 'en' }).locale, 'tr');
  first.setLocale('en'); assert.equal(first.t('nav.play'), 'PLAY');
  assert.equal(first.setLocale('es'), false); remove(); first.setLocale('tr');
  assert.deepEqual(updates, ['tr', 'en']);
  const denied = createI18n({ backend: createStorage({ getBackend: () => { throw Error('denied'); } }), browserLanguage: 'tr' });
  denied.setLocale('en'); assert.equal(denied.locale, 'en');
});
test('fallback/interpolation is safe, debug friendly and dictionaries have parity', () => {
  assert.equal(translate('tr', 'hello', { name: '<script>' }, { en: { hello: 'Hi {name}' }, tr: {} }), 'Hi <script>');
  assert.equal(translate('tr', 'missing'), '[missing]');
  assert.equal(translate('tr', 'constructor'), '[constructor]');
  assert.equal(translate('en', 'x', {}, { en: { x: '{value}' } }), '{value}');
  assert.deepEqual(Object.keys(messages.tr).sort(), Object.keys(messages.en).sort());
  for (const locale of ['tr', 'en']) for (const value of Object.values(messages[locale])) assert.ok(typeof value === 'string' && value.length);
  assert.match(messages.tr['game.quality.INCREDIBLE'], /İ/);
  assert.match(messages.tr['section.create.note'], /ı/);
  const intl = createI18n({ backend: { get: () => 'tr', set: () => true } });
  assert.equal(intl.number(1.5), '1,5'); assert.ok(intl.date(new Date('2026-10-04T00:00:00Z')).includes('2026'));
});

test('every generated v2 UI key resolves in both dictionaries', async () => {
  for (const route of ['home', ...sections.map((section) => section.id)]) {
    const html = await readFile(`site/v2/${route === 'home' ? '' : route + '/'}index.html`, 'utf8');
    for (const match of html.matchAll(/data-i18n(?:-label|-content)?="([^"]+)"/g)) {
      for (const locale of ['tr', 'en']) assert.ok(Object.hasOwn(messages[locale], match[1]), `${locale}: ${match[1]}`);
    }
  }
});
test('sharing translates UI, preserving scores, day, brand and URL', () => {
  const result = { dayKey: '2026-10-04', actualMs: 5070 };
  const en = resultShare(result, { locale: 'en' }); const tr = resultShare(result, { locale: 'tr' });
  assert.match(en.text, /KATOVIA DAILY #001[\s\S]*GREAT/);
  assert.match(tr.text, /KATOVIA GÜNLÜK #001[\s\S]*HARİKA/);
  for (const value of [en, tr]) { assert.match(value.text, /2026-10-04[\s\S]*5.07[\s\S]*\+0.07/); assert.equal(value.url, 'https://katovia.com/v2/today/'); }
});

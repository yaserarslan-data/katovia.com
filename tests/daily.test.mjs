import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttempt, scoreAttempt } from '../src/games/stop-at-five/logic.js';
import { createDailyEngine, dayKey, getDailyConfig, validResult, isDayKey } from '../src/engines/daily.js';
import { createStorage } from '../src/core/storage.js';
import { resultShare } from '../src/games/stop-at-five/share.js';

const memory = () => {
  const data = new Map();
  return { data, getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
};
const result = (key, actualMs = 5070) => ({ schemaVersion: 1, dayKey: key, gameId: 'stop-at-five', gameVersion: '1', actualMs, scoreMs: Math.abs(actualMs - 5000), completedAt: `${key}T12:00:00.000Z` });

test('target difference before, after and exact; fractional boundary labels', () => {
  assert.equal(scoreAttempt(4980).scoreMs, 20);
  assert.equal(scoreAttempt(5070).scoreMs, 70);
  assert.equal(scoreAttempt(5510).scoreMs, 510);
  assert.equal(scoreAttempt(5000).exact, true);
  assert.equal(scoreAttempt(5000.01).exact, false);
  for (const [difference, quality] of [[20, 'PERFECT'], [20.1, 'INCREDIBLE'], [50, 'INCREDIBLE'], [50.1, 'GREAT'], [100, 'GREAT'], [100.1, 'GOOD'], [250, 'GOOD'], [250.1, 'CLOSE'], [500, 'CLOSE'], [500.1, 'OFF']]) assert.equal(scoreAttempt(5000 + difference).quality, quality);
  for (const value of [-1, NaN, Infinity, 3600001]) assert.throws(() => scoreAttempt(value));
});
test('injectable monotonic clock state transitions, double stop and interruption', () => {
  let time = 1000;
  const attempt = createAttempt({ clock: () => time });
  assert.equal(attempt.stop(), null);
  assert.equal(attempt.start(), true);
  assert.equal(attempt.start(), false);
  time = 5980; assert.equal(attempt.stop().scoreMs, 20);
  assert.equal(attempt.state, 'completed');
  assert.equal(attempt.stop(), null); assert.equal(attempt.start(), false);
  const next = createAttempt({ clock: () => time });
  next.start(); assert.equal(next.interrupt(), true); assert.equal(next.stop(), null);
  assert.equal(next.start(), true); time += 5000; assert.equal(next.stop().exact, true);
});
test('non-monotonic test clock safely interrupts instead of recording', () => {
  let time = 10; const attempt = createAttempt({ clock: () => time });
  attempt.start(); time = 9;
  assert.equal(attempt.stop(), null); assert.equal(attempt.state, 'interrupted');
});
test('UTC daily config, seed, new day and preview number are deterministic', () => {
  const a = getDailyConfig(new Date('2026-10-04T00:00:00Z'));
  assert.deepEqual(a, getDailyConfig(new Date('2026-10-04T23:59:59.999Z')));
  assert.equal(a.number, 1);
  const b = getDailyConfig(new Date('2026-10-05T00:00:00Z'));
  assert.equal(b.number, 2); assert.notEqual(a.seed, b.seed);
  assert.equal(dayKey(new Date('2026-10-05T02:59:59+03:00')), '2026-10-04');
  assert.equal(isDayKey('2026-02-30'), false);
});
test('first daily record survives refresh and cannot be overwritten; streak duplicate/consecutive/gap', () => {
  const backend = memory(); const storage = createStorage({ getBackend: () => backend });
  const daily = createDailyEngine({ storage });
  assert.equal(daily.result('2026-10-04'), null);
  assert.equal(daily.record(result('2026-10-04')).saved, true);
  assert.equal(daily.record(result('2026-10-04', 5000)).existing, true);
  assert.equal(daily.result('2026-10-04').actualMs, 5070);
  const refreshed = createDailyEngine({ storage });
  assert.equal(refreshed.result('2026-10-04').actualMs, 5070);
  assert.equal(refreshed.record(result('2026-10-05')).streak.current, 2);
  assert.equal(refreshed.record(result('2026-10-05')).streak.current, 2);
  assert.equal(refreshed.streak('2026-10-06').current, 2);
  assert.equal(refreshed.streak('2026-10-07').current, 0);
  assert.equal(refreshed.record(result('2026-10-08')).streak.current, 1);
  assert.equal(refreshed.streak('2026-10-08').lastCompletedDay, '2026-10-08');
});
test('denied/quota storage preserves a shareable result in memory, not falsely persisted', () => {
  const daily = createDailyEngine({ storage: createStorage({ getBackend: () => { throw new Error('Denied'); } }) });
  const recorded = daily.record(result('2026-10-04'));
  assert.equal(recorded.saved, false);
  assert.equal(daily.isPersisted('2026-10-04'), false);
  assert.equal(daily.result('2026-10-04').actualMs, 5070);
  assert.equal(daily.record(result('2026-10-04', 5000)).result.actualMs, 5070);
  assert.match(resultShare(recorded.result, { locale: 'en' }).text, /5\.07 SEC/);
});
test('malformed JSON, previous schema and tampered results are rejected', () => {
  const backend = memory(); const storage = createStorage({ getBackend: () => backend });
  for (const value of ['{broken', JSON.stringify({ version: 0, value: { schemaVersion: 1, results: { '2026-10-04': result('2026-10-04') } } }), JSON.stringify({ version: 1, value: { schemaVersion: 0, results: {} } })]) {
    backend.setItem('katovia:v2:daily-ledger', value);
    assert.equal(createDailyEngine({ storage }).result('2026-10-04'), null);
  }
  for (const mutation of [{ actualMs: -1 }, { scoreMs: 0 }, { gameVersion: '0' }, { completedAt: '2026-10-05T00:00:00Z' }, { schemaVersion: 0 }, { actualMs: '<img onerror=alert(1)>' }]) assert.equal(validResult({ ...result('2026-10-04'), ...mutation }, '2026-10-04'), false);
});
test('daily share format and optional raw score, using one preview epoch', () => {
  const share = resultShare(result('2026-10-04'), { locale: 'en' });
  assert.equal(share.text, 'KATOVIA DAILY #001\n2026-10-04\n\n🟩🟩🟩🟩⬜\n⚡ GREAT\n⏱️ 5.07 SEC\n+0.07s');
  assert.equal(share.url, 'https://katovia.com/today/');
  assert.doesNotMatch(resultShare(result('2026-10-04'), { includeScore: false }).text, /5\.07|0\.07/);
  assert.match(resultShare(result('2026-10-05', 5000), { locale: 'en' }).text, /#002[\s\S]*PERFECT 5\.00/);
});

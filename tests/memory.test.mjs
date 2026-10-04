import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyPattern, difficulty, scoreMemory, engineOptions, memoryTiles } from '../src/games/memory-grid/logic.js';
import { createDailyEngine } from '../src/engines/daily.js';
test('seeded memory patterns, weekly difficulty and scoring are deterministic', () => {
  const key = '2026-10-05'; const settings = dailyPattern(key);
  assert.deepEqual(settings, dailyPattern(key)); assert.equal(settings.size, 3); assert.equal(new Set(settings.pattern).size, 3);
  assert.equal(difficulty('2026-10-10').size, 4);
  assert.equal(scoreMemory(key, settings.pattern).accuracy, 100);
  assert.equal(scoreMemory(key, []).missed, 3);
  assert.equal(scoreMemory(key, Array.from({ length: 9 }, (_, i) => i)).wrong, 6);
  assert.throws(() => scoreMemory(key, [1, 1])); assert.throws(() => scoreMemory(key, [99]));
  const result = scoreMemory(key, settings.pattern); assert.equal(memoryTiles(result), '🟩🟩🟩');
});
test('memory reuses ledger engine without overwriting precision; first result immutable, corrupt score rejected', () => {
  const values = new Map(); const storage = { get: (key) => values.get(key), set: (key, value) => { values.set(key, value); return true; } };
  const engine = createDailyEngine({ ...engineOptions, storage }); const key = '2026-10-05'; const selection = dailyPattern(key).pattern;
  const result = { schemaVersion: 1, dayKey: key, gameId: 'memory-grid', gameVersion: '1', completedAt: key+'T12:00:00Z', selection, ...scoreMemory(key, selection) };
  assert.equal(engine.record(result).result.accuracy, 100); assert.equal(engine.record({ ...result, selection: [], ...scoreMemory(key, []) }).existing, true);
  assert.equal(createDailyEngine({ ...engineOptions, storage }).result(key).hits, 3);
  assert.equal(values.has('daily-ledger'), false); assert.equal(engine.streak(key).current, 1);
  assert.throws(() => engine.record({ ...result, score: 500 }));
});

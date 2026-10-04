import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReaction, randomDelay } from '../src/games/reaction/logic.js';
test('reaction pure engine supports early retry, monotonic signal timing, interruption and one completion', () => {
  let time = 100; const game = createReaction({ clock: () => time }); game.start(); assert.equal(game.tap().early, true);
  game.start(); game.signal(); time = 284; assert.equal(game.tap().actualMs, 184); assert.equal(game.tap(), null);
  const interrupted = createReaction(); interrupted.start(); assert.equal(interrupted.interrupt(), true); assert.equal(interrupted.signal(), false);
  const invalid = createReaction({ clock: () => time }); invalid.start(); invalid.signal(); time = 0; assert.equal(invalid.tap(), null);
});
test('unbiased crypto delay stays in range and rejects out-of-range random values', () => {
  assert.equal(randomDelay({ getRandomValues: (array) => { array[0] = 0; return array; } }), 1500);
  let calls = 0; const value = randomDelay({ getRandomValues: (array) => { array[0] = calls++ ? 2500 : 0xffffffff; return array; } });
  assert.equal(value, 4000); assert.equal(calls, 2);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mount } from '../src/games/stop-at-five/mount.js';
import { createDailyEngine } from '../src/engines/daily.js';
import { gameMarkup } from '../src/games/stop-at-five/markup.js';

class Target extends EventTarget {
  listeners = new Map();
  dataset = {};
  checked = true;
  addEventListener(type, listener) { super.addEventListener(type, listener); if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(listener); }
  removeEventListener(type, listener) { super.removeEventListener(type, listener); this.listeners.get(type)?.delete(listener); }
  get count() { return [...this.listeners.values()].reduce((n, items) => n + items.size, 0); }
  focus() {}
  select() {}
}
function environment() {
  const nodes = new Map();
  const win = new Target(); const doc = new Target(); const container = new Target();
  const timers = new Map(); let timer = 0;
  win.setTimeout = (fn) => { timers.set(++timer, fn); return timer; };
  win.clearTimeout = (id) => timers.delete(id);
  doc.hidden = false; doc.hasFocus = () => true; doc.defaultView = win;
  container.ownerDocument = doc;
  for (const match of gameMarkup().matchAll(/\b(data-[a-z-]+)(?=[\s=>])/g)) nodes.set(`[${match[1]}]`, new Target());
  container.querySelector = (selector) => nodes.get(selector) || null;
  return { nodes, win, doc, container, timers, action: () => container.querySelector('[data-game-action]') };
}
const key = (target, repeat = false) => target.dispatchEvent(Object.assign(new Event('keydown', { cancelable: true }), { key: 'Enter', repeat }));
test('mount/dispose/remount cleans all listeners and day timer; held key and double completion ignored', () => {
  const env = environment(); let clock = 1000; const events = [];
  const values = new Map(); const engine = createDailyEngine({ storage: { get: (k) => values.get(k), set: (k, v) => { values.set(k, v); return true; } } });
  const options = { engine, clock: () => clock, now: () => new Date('2026-10-04T12:00:00Z'), navigatorObject: {}, emit: (event, payload) => events.push({ event, payload }) };
  let game = mount(env.container, options);
  assert.equal(env.timers.size, 1);
  key(env.action()); assert.equal(game.state, 'running');
  key(env.action(), true); assert.equal(game.state, 'running');
  game.dispose(); assert.equal(env.timers.size, 0);
  assert.equal(env.doc.count + env.win.count + [...env.nodes.values()].reduce((n, node) => n + node.count, 0), 0);
  clock = 3000; key(env.action()); assert.equal(engine.result('2026-10-04'), null);
  game = mount(env.container, options); key(env.action()); clock = 8000; key(env.action());
  assert.equal(game.state, 'completed'); key(env.action());
  assert.equal(engine.result('2026-10-04').actualMs, 5000);
  assert.equal(events.filter((event) => event.event === 'game_complete').length, 1);
  assert.deepEqual(events.find((event) => event.event === 'game_complete').payload, { game_id: 'stop-at-five', game_version: '1', mode: 'daily', score_bucket: 0, duration_bucket: 5 });
  game.dispose(); assert.equal(env.timers.size, 0);
});
test('focus loss and midnight interruption do not consume a daily result', () => {
  const env = environment(); let clock = 1000; let date = '2026-10-04T23:59:58Z';
  const engine = createDailyEngine({ storage: { get: () => null, set: () => false } });
  const game = mount(env.container, { engine, clock: () => clock, now: () => new Date(date), navigatorObject: {}, emit: () => {} });
  key(env.action()); env.win.dispatchEvent(new Event('blur'));
  assert.equal(game.state, 'interrupted'); assert.equal(engine.result('2026-10-04'), null);
  clock = 2000; key(env.action()); date = '2026-10-05T00:00:03Z'; clock = 7000; key(env.action());
  assert.equal(game.state, 'idle'); assert.equal(engine.result('2026-10-04'), null); assert.equal(engine.result('2026-10-05'), null);
  game.dispose();
});

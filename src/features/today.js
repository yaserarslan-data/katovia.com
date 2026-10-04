import '../styles/daily.css';
import '../styles/activities.css';
import { createDailyEngine } from '../engines/daily.js';
import { mount } from '../games/stop-at-five/mount.js';
import { mount as mountMemory } from '../games/memory-grid/mount.js';
import { mount as mountReaction } from '../games/reaction/mount.js';

const engine = createDailyEngine();
export function getDailyMount(root = document) {
  return root.querySelector('[data-daily-mount]');
}
export function mountDaily(root = document) {
  const container = getDailyMount(root);
  const precision = container ? mount(container, { engine }) : null;
  const memoryRoot = root.querySelector('[data-memory-mount]');
  const memory = memoryRoot ? mountMemory(memoryRoot) : null;
  const reactionRoot = root.querySelector('[data-reaction-mount]');
  const reaction = reactionRoot ? mountReaction(reactionRoot) : null;
  return precision || memory || reaction ? { dispose() { precision?.dispose(); memory?.dispose(); reaction?.dispose(); } } : null;
}

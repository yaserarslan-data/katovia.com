import '../styles/daily.css';
import { createDailyEngine } from '../engines/daily.js';
import { mount } from '../games/stop-at-five/mount.js';

const engine = createDailyEngine();
export function getDailyMount(root = document) {
  return root.querySelector('[data-daily-mount]');
}
export function mountDaily(root = document) {
  const container = getDailyMount(root);
  return container ? mount(container, { engine }) : null;
}

import { gameConfig } from './config.js';

export function scoreAttempt(actualMs) {
  if (!Number.isFinite(actualMs) || actualMs < 0 || actualMs > gameConfig.maxDurationMs) throw new RangeError('Invalid duration');
  const scoreMs = Math.abs(actualMs - gameConfig.targetMs);
  const quality = gameConfig.qualities.find((item) => scoreMs <= item.maxMs);
  return { actualMs, scoreMs, quality: quality.label, tiles: quality.tiles, exact: actualMs === gameConfig.targetMs };
}

// No ticking interval or animation frame: only two monotonic clock samples.
export function createAttempt({ clock = () => performance.now() } = {}) {
  let state = 'idle';
  let startedAt;
  return {
    get state() { return state; },
    start() {
      if (!['idle', 'interrupted'].includes(state)) return false;
      startedAt = clock();
      state = 'running';
      return true;
    },
    stop() {
      if (state !== 'running') return null;
      const actualMs = clock() - startedAt;
      try {
        const score = scoreAttempt(actualMs);
        state = 'completed';
        return score;
      } catch { state = 'interrupted'; return null; }
    },
    interrupt() {
      if (state !== 'running') return false;
      state = 'interrupted';
      return true;
    },
  };
}

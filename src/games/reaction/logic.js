export const config = Object.freeze({ id: 'reaction', version: '1', previewEpoch: '2026-10-04' });
export function randomDelay(cryptoObject = globalThis.crypto) {
  const range = 2501; const limit = 0x100000000 - (0x100000000 % range); let value;
  do { value = cryptoObject.getRandomValues(new Uint32Array(1))[0]; } while (value >= limit);
  return 1500 + value % range;
}
export function createReaction({ clock = () => performance.now() } = {}) {
  let state = 'ready'; let signaledAt;
  return {
    get state() { return state; },
    start() { if (!['ready', 'early', 'interrupted'].includes(state)) return false; state = 'waiting'; return true; },
    signal() { if (state !== 'waiting') return false; signaledAt = clock(); state = 'signal'; return true; },
    tap() { if (state === 'waiting') { state = 'early'; return { early: true }; } if (state !== 'signal') return null; const actualMs = clock() - signaledAt; if (actualMs < 0 || actualMs > 60000) { state = 'interrupted'; return null; } state = 'completed'; return { actualMs }; },
    interrupt() { if (!['waiting', 'signal'].includes(state)) return false; state = 'interrupted'; return true; },
  };
}
export const engineOptions = {
  game: config,
  validateScore(result) { return Number.isFinite(result.actualMs) && result.actualMs >= 0 && result.actualMs <= 60000; },
  clean(result) { const { schemaVersion, dayKey, gameId, gameVersion, completedAt, actualMs } = result; return { schemaVersion, dayKey, gameId, gameVersion, completedAt, actualMs }; },
};

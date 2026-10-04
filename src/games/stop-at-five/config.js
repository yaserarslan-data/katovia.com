export const gameConfig = Object.freeze({
  id: 'stop-at-five', version: '1', targetMs: 5000,
  previewEpoch: '2026-10-04', schemaVersion: 1,
  // Public parallel preview route; legacy root stays unchanged.
  shareUrl: 'https://katovia.com/v2/today/',
  maxDurationMs: 3600000,
  qualities: Object.freeze([
    { maxMs: 20, label: 'PERFECT', tiles: '🟩🟩🟩🟩🟩' },
    { maxMs: 50, label: 'INCREDIBLE', tiles: '🟩🟩🟩🟩🟨' },
    { maxMs: 100, label: 'GREAT', tiles: '🟩🟩🟩🟩⬜' },
    { maxMs: 250, label: 'GOOD', tiles: '🟩🟩🟩⬜⬜' },
    { maxMs: 500, label: 'CLOSE', tiles: '🟩🟩⬜⬜⬜' },
    { maxMs: Infinity, label: 'OFF', tiles: '🟩⬜⬜⬜⬜' },
  ]),
});

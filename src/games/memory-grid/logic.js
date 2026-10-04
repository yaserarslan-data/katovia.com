import { getDailyConfig } from '../../engines/daily.js';
export const config = Object.freeze({ id: 'memory-grid', version: '1', previewEpoch: '2026-10-04' });
export function difficulty(dayKey) {
  const weekday = new Date(`${dayKey}T00:00:00Z`).getUTCDay();
  return { size: weekday >= 1 && weekday <= 2 ? 3 : 4, count: weekday >= 1 && weekday <= 2 ? 3 : weekday === 0 || weekday === 6 ? 6 : 4, revealMs: 1600 };
}
export function dailyPattern(dayKey) {
  const settings = difficulty(dayKey); let seed = getDailyConfig(new Date(`${dayKey}T00:00:00Z`), config).seed;
  const cells = Array.from({ length: settings.size ** 2 }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; const j = seed % (i + 1); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  return { ...settings, pattern: cells.slice(0, settings.count).sort((a, b) => a - b) };
}
export function scoreMemory(dayKey, selection) {
  const { size, pattern } = dailyPattern(dayKey);
  if (!Array.isArray(selection) || selection.length > size ** 2 || new Set(selection).size !== selection.length || selection.some((value) => !Number.isInteger(value) || value < 0 || value >= size ** 2)) throw new TypeError('Invalid selection');
  const hits = selection.filter((cell) => pattern.includes(cell)).length;
  const wrong = selection.length - hits; const missed = pattern.length - hits;
  const score = Math.max(0, hits - wrong);
  const accuracy = Math.round(100 * hits / (pattern.length + wrong));
  return { hits, wrong, missed, accuracy, score, total: pattern.length, size };
}
export const engineOptions = {
  game: config,
  validateScore(result) { const score = scoreMemory(result.dayKey, result.selection); return Object.entries(score).every(([key, value]) => result[key] === value); },
  clean(result) { const { schemaVersion, dayKey, gameId, gameVersion, completedAt } = result; return { schemaVersion, dayKey, gameId, gameVersion, completedAt, selection: [...result.selection], ...scoreMemory(dayKey, result.selection) }; },
};
// Aggregated tiles describe performance, not the answer's cell positions.
export function memoryTiles(result) { const tiles = [...('🟩'.repeat(result.hits) + '🟥'.repeat(result.wrong) + '⬛'.repeat(result.missed))]; const rows = []; for (let i = 0; i < tiles.length; i += result.size) rows.push(tiles.slice(i, i + result.size).join('')); return rows.join('\n'); }

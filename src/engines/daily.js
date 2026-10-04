import { storage as defaultStorage } from '../core/storage.js';
import { gameConfig } from '../games/stop-at-five/config.js';
import { scoreAttempt } from '../games/stop-at-five/logic.js';

const dayMs = 86400000;
export function dayKey(date = new Date()) { return date.toISOString().slice(0, 10); }
export function isDayKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && dayKey(new Date(timestamp)) === value;
}
export function shiftDay(key, amount) { return dayKey(new Date(Date.parse(`${key}T00:00:00Z`) + amount * dayMs)); }
export function getDailyConfig(date = new Date()) {
  const key = dayKey(date);
  let seed = 2166136261;
  for (const char of key) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  return { dayKey: key, gameId: gameConfig.id, gameVersion: gameConfig.version, seed, number: Math.max(1, Math.floor((Date.parse(key) - Date.parse(gameConfig.previewEpoch)) / dayMs) + 1) };
}

export function validResult(result, key) {
  if (!isDayKey(key) || !result || result.dayKey !== key || result.gameId !== gameConfig.id || result.gameVersion !== gameConfig.version || result.schemaVersion !== gameConfig.schemaVersion) return false;
  try {
    return result.scoreMs === scoreAttempt(result.actualMs).scoreMs && typeof result.completedAt === 'string' && dayKey(new Date(result.completedAt)) === key;
  } catch { return false; }
}
function validLedger(raw) {
  const results = Object.create(null);
  if (raw?.schemaVersion !== 1 || !raw.results || typeof raw.results !== 'object' || Array.isArray(raw.results)) return results;
  for (const [key, result] of Object.entries(raw.results)) {
    if (validResult(result, key)) results[key] = {
      schemaVersion: 1, dayKey: key, gameId: result.gameId, gameVersion: result.gameVersion,
      scoreMs: result.scoreMs, actualMs: result.actualMs, completedAt: result.completedAt,
    };
  }
  return results;
}
export function streakFor(results, key) {
  let cursor = results[key] ? key : shiftDay(key, -1);
  let count = 0;
  while (results[cursor]) { count++; cursor = shiftDay(cursor, -1); }
  const completed = Object.keys(results).filter((day) => day <= key).sort();
  return { current: count, lastCompletedDay: completed.at(-1) || null };
}

// Single small ledger keeps result and derived streak atomic. No authoritative scores.
export function createDailyEngine({ storage = defaultStorage } = {}) {
  const sessionResults = Object.create(null);
  const read = () => {
    const persisted = validLedger(storage.get('daily-ledger'));
    for (const key of Object.keys(persisted)) delete sessionResults[key];
    return { ...sessionResults, ...persisted };
  };
  return {
    result(key) { return read()[key] || null; },
    isPersisted(key) { return !!validLedger(storage.get('daily-ledger'))[key]; },
    streak(key) { return streakFor(read(), key); },
    record(result) {
      if (!validResult(result, result?.dayKey)) throw new TypeError('Invalid daily result');
      const results = read();
      if (results[result.dayKey]) return { result: results[result.dayKey], existing: true, saved: !sessionResults[result.dayKey], streak: streakFor(results, result.dayKey) };
      results[result.dayKey] = result;
      const saved = storage.set('daily-ledger', { schemaVersion: 1, results });
      if (!saved) sessionResults[result.dayKey] = result;
      return { result, existing: false, saved, streak: streakFor(results, result.dayKey) };
    },
  };
}

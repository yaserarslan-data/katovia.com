const eventNames = new Set(['play_experience_opened', 'home_view', 'daily_view', 'page_view', 'game_start', 'game_complete', 'share_opened', 'share_completed', 'share_cancelled', 'share_failed', 'duel_created', 'duel_opened', 'duel_completed', 'rematch_clicked', 'creator_started', 'creator_published', 'creation_opened', 'tool_opened', 'returning_user', 'daily_streak']);
const enumFields = {
  mode: new Set(['daily', 'practice', 'duel']),
  channel: new Set(['native', 'clipboard', 'manual']),
  outcome: new Set(['handoff', 'copied', 'cancelled', 'failed']),
  status: new Set(['available', 'planned', 'legacy']),
};
const idFields = new Set(['route_key', 'experience_id', 'game_id', 'game_version', 'template_id', 'tool_slug', 'app_version']);
const numberFields = new Set(['schema_version', 'duration_bucket', 'score_bucket', 'question_count_bucket', 'days_since_bucket', 'streak_bucket']);

// No provider, persistence, identity or network. Unknown fields are discarded.
// Allowed IDs are application-owned constants, never user-supplied strings.
export function sanitizeEvent(eventName, payload = {}) {
  if (!eventNames.has(eventName) || !payload || typeof payload !== 'object') return null;
  const safe = {};
  for (const [key, value] of Object.entries(payload)) {
    if (enumFields[key]?.has(value)) safe[key] = value;
    else if (idFields.has(key) && typeof value === 'string' && /^[a-z0-9_-]{1,48}$/i.test(value)) safe[key] = value;
    else if (numberFields.has(key) && Number.isSafeInteger(value) && value >= 0 && value <= 100000) safe[key] = value;
  }
  return { eventName, payload: safe };
}

export function track(eventName, payload) {
  // Deliberately no-op; validation result is useful for caller tests.
  return sanitizeEvent(eventName, payload) !== null;
}

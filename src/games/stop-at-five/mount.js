import { i18n, t } from '../../i18n/index.js';
import { gameConfig } from './config.js';
import { createAttempt, scoreAttempt } from './logic.js';
import { getDailyConfig } from '../../engines/daily.js';
import { resultShare } from './share.js';
import { shareText, copyText } from '../../core/share.js';
import { track } from '../../core/analytics.js';

// Same mount in home and TODAY. Injected clocks/engine keep tests deterministic.
export function mount(container, {
  engine, clock = () => performance.now(), now = () => new Date(),
  navigatorObject = globalThis.navigator, emit = track,
  doc = container.ownerDocument, win = doc.defaultView,
} = {}) {
  const find = (name) => container.querySelector(`[data-${name}]`);
  const button = find('game-action');
  if (!button || !engine) throw new TypeError('Daily markup and engine required');
  let config = getDailyConfig(now());
  let attempt = createAttempt({ clock });
  let official = engine.result(config.dayKey);
  let disposed = false;
  let saving = false;
  let pendingShare = false;
  let lastActivation = -Infinity;
  let rolloverTimer;
  let shareStatus = '';
  let specialFeedback = '';
  const copy = new Proxy({}, { get: (_, key) => t(`game.feedback.${key}`) });
  let saved = !official || engine.isPersisted(config.dayKey);
  const listeners = [];
  const listen = (target, event, fn) => {
    target.addEventListener(event, fn);
    listeners.push(() => target.removeEventListener(event, fn));
  };
  const payload = () => ({ game_id: gameConfig.id, game_version: gameConfig.version, mode: 'daily' });
  const state = () => official ? 'completed' : attempt.state;
  const feedback = (message) => { find('feedback').textContent = message; };

  function render({ announce = true } = {}) {
    if (disposed) return;
    const current = state();
    container.dataset.state = current;
    find('game-day').textContent = `${config.dayKey} / #${String(config.number).padStart(3, '0')}`;
    const streak = engine.streak(config.dayKey).current;
    find('streak').textContent = t(streak === 1 ? 'daily.streak.one' : 'daily.streak', { count: streak });
    find('result').hidden = !official;
    find('result-actions').hidden = !official;
    find('target-number').hidden = false;
    button.hidden = !!official;
    button.disabled = saving;
    button.textContent = t(current === 'running' ? 'game.stop' : 'game.start');
    find('instructions').textContent = t(`game.instructions.${official ? 'completed' : current === 'running' ? 'running' : 'idle'}`);
    if (official) {
      const score = scoreAttempt(official.actualMs);
      const delta = (official.actualMs - gameConfig.targetMs) / 1000;
      find('actual').textContent = (official.actualMs / 1000).toFixed(2);
      find('difference').textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}s`;
      find('quality').textContent = `${t(`game.quality.${score.quality}`)}${score.exact ? ' 5.00' : ''}`;
      find('precision').textContent = t('game.precision', { value: i18n.number(score.scoreMs, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) });
      container.dataset.exact = String(score.exact);
      if (announce) feedback(t('game.announcement', { value: (official.actualMs / 1000).toFixed(2), quality: t(`game.quality.${score.quality}`), status: saved ? copy.completed : copy.unsaved }));
    } else if (announce) feedback(specialFeedback ? copy[specialFeedback] : copy[current] || copy.idle);
    if (shareStatus) find('share-feedback').textContent = copy[shareStatus];
    if (official && !find('manual').hidden) { const content = resultShare(official, { includeScore: find('include-score').checked }); find('share-text').value = `${content.text}\n${content.url}`; }
  }

  function refreshDay() {
    if (disposed) return;
    const next = getDailyConfig(now());
    if (next.dayKey !== config.dayKey) {
      attempt.interrupt();
      config = next;
      attempt = createAttempt({ clock });
      official = engine.result(config.dayKey);
      find('manual').hidden = true;
      shareStatus = ''; find('share-feedback').textContent = '';
      saved = !official || engine.isPersisted(config.dayKey);
      render();
      if (!official) { specialFeedback = 'rollover'; feedback(copy.rollover); }
    } else {
      const recorded = engine.result(config.dayKey);
      if (recorded && !official) { attempt.interrupt(); official = recorded; render(); }
    }
  }

  function scheduleRollover() {
    win.clearTimeout(rolloverTimer);
    const date = now();
    const nextMidnight = new Date(date); nextMidnight.setUTCHours(24, 0, 0, 0);
    rolloverTimer = win.setTimeout(() => { refreshDay(); scheduleRollover(); }, Math.max(100, nextMidnight - date + 25));
  }

  function interrupt() {
    if (attempt.interrupt()) render();
  }

  async function activate() {
    if (disposed || saving) return;
    const stamp = clock();
    if (stamp - lastActivation < 220) return; // Suppress rapid duplicate taps/keyboard clicks.
    lastActivation = stamp;
    const previousDay = config.dayKey;
    refreshDay();
    if (previousDay !== config.dayKey || official) return;
    if (doc.hidden || !doc.hasFocus()) { interrupt(); return; }
    if (attempt.state !== 'running') {
      specialFeedback = ''; attempt.start();
      emit('game_start', payload());
      render();
      return;
    }
    const score = attempt.stop();
    if (!score) { render(); return; }
    const completedAt = now();
    if (getDailyConfig(completedAt).dayKey !== config.dayKey) { refreshDay(); return; }
    const result = { schemaVersion: gameConfig.schemaVersion, dayKey: config.dayKey, gameId: gameConfig.id, gameVersion: gameConfig.version, actualMs: score.actualMs, scoreMs: score.scoreMs, completedAt: completedAt.toISOString() };
    saving = true; button.disabled = true;
    const record = () => engine.record(result);
    try {
      // Origin-local serialization prevents simultaneous tab writes where supported.
      let stored;
      try {
        stored = typeof navigatorObject?.locks?.request === 'function'
          ? await navigatorObject.locks.request('katovia:v2:daily', record) : record();
      } catch { stored = record(); }
      if (disposed) return;
      if (result.dayKey !== getDailyConfig(now()).dayKey) { refreshDay(); return; }
      official = stored.result; saved = stored.saved;
      if (!stored.existing) emit('game_complete', { ...payload(), score_bucket: Math.min(100000, Math.floor(score.scoreMs / 50)), duration_bucket: Math.min(100000, Math.floor(score.actualMs / 1000)) });
    } finally { saving = false; render(); }
  }

  listen(button, 'pointerdown', (event) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault(); button.focus({ preventScroll: true }); void activate();
  });
  listen(button, 'keydown', (event) => {
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault(); if (!event.repeat) void activate();
  });
  listen(button, 'keyup', (event) => { if ([' ', 'Enter'].includes(event.key)) event.preventDefault(); });
  listen(button, 'click', (event) => { if (event.detail === 0) void activate(); });
  listen(doc, 'visibilitychange', () => { if (doc.hidden) interrupt(); else refreshDay(); });
  listen(win, 'blur', interrupt);
  listen(win, 'focus', refreshDay);
  listen(win, 'storage', refreshDay);

  async function share(method) {
    if (!official || pendingShare || disposed) return;
    pendingShare = true;
    find('share').disabled = true; find('copy').disabled = true;
    const content = resultShare(official, { includeScore: find('include-score').checked });
    emit('share_opened', { ...payload(), channel: method === 'copy' ? 'clipboard' : 'native' });
    try {
      const outcome = method === 'copy' ? await copyText(`${content.text}\n${content.url}`, navigatorObject) : await shareText(content, navigatorObject);
      if (disposed) return;
      shareStatus = outcome.status; find('share-feedback').textContent = copy[outcome.status] || copy.manual;
      find('manual').hidden = outcome.status !== 'manual';
      if (outcome.status === 'manual') { find('share-text').value = outcome.text; find('share-text').focus(); find('share-text').select(); }
      if (['copied', 'handoff'].includes(outcome.status)) emit('share_completed', { ...payload(), outcome: outcome.status, channel: outcome.status === 'copied' ? 'clipboard' : 'native' });
    } finally {
      pendingShare = false;
      if (!disposed) { find('share').disabled = false; find('copy').disabled = false; }
    }
  }
  listen(find('share'), 'click', () => { void share('native'); });
  listen(find('copy'), 'click', () => { void share('copy'); });
  const unsubscribeLocale = i18n.subscribe(() => render());
  render(); scheduleRollover();
  emit('daily_view', payload());
  return {
    get state() { return state(); },
    dispose() { unsubscribeLocale(); disposed = true; attempt.interrupt(); win.clearTimeout(rolloverTimer); listeners.forEach((remove) => remove()); button.disabled = true; },
    resume() { refreshDay(); scheduleRollover(); },
  };
}

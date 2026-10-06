import { createDailyEngine, dayKey, getDailyConfig } from '../engines/daily.js';
import { t, i18n } from '../i18n/index.js';
import { shareText, copyText } from '../core/share.js';
import { track } from '../core/analytics.js';
import {encodeTarget} from '../duel/model.js';
const engines = new Map();
export function dailySession(root, options, { onInterrupt = () => {}, onRender = () => {}, shareResult } = {}) {
  if (!engines.has(options.game.id)) engines.set(options.game.id, createDailyEngine(options));
  const engine = engines.get(options.game.id); let key = dayKey(); let result = engine.result(key); let disposed = false; let sharing = false; let timer;
  const payload = () => ({ game_id: options.game.id, game_version: options.game.version, mode: 'daily' });
  const status = root.querySelector('[data-session-status]');
  const actions = root.querySelector('[data-session-actions]');
  const manual = root.querySelector('[data-session-manual]');
  const listeners = []; const listen = (target, event, fn) => { target.addEventListener(event, fn); listeners.push(() => target.removeEventListener(event, fn)); };
  function render() {
    if (disposed) return;
    actions.hidden = !result;
    const next=root.querySelector('[data-session-next]');const nextKey=options.game.id==='memory-grid'?'reaction':'play';
    next.href=nextKey==='reaction'?'/today/#reaction':'/play/particle-universe/';next.dataset.i18n=`daily.next.${nextKey}`;next.textContent=t(next.dataset.i18n);
    root.querySelector('[data-session-challenge]').hidden=options.game.id!=='reaction';
    root.querySelector('[data-session-day]').textContent = `${key} / #${getDailyConfig(new Date(`${key}T00:00:00Z`), options.game).number}`;
    const count=engine.streak(key).current;root.querySelector('[data-session-streak]').textContent = t(count===1?'daily.streak.one':'daily.streak', { count });
    if (result) status.textContent = t(engine.isPersisted(key) ? 'game.feedback.completed' : 'game.feedback.unsaved');
    onRender(result);
  }
  function refresh() {
    const next = dayKey();
    if (next !== key) { onInterrupt(); key = next; result = engine.result(key); manual.hidden = true; status.textContent = t('game.feedback.rollover'); }
    else { const stored = engine.result(key); if (stored && !result) { onInterrupt(); result = stored; } }
    render();
  }
  function schedule() { clearTimeout(timer); const date = new Date(); const next = new Date(date); next.setUTCHours(24, 0, 0, 0); timer = setTimeout(() => { refresh(); schedule(); }, next - date + 25); }
  async function commit(fields) {
    if (disposed || result) return result;
    if (dayKey() !== key) { refresh(); return null; }
    const value = { schemaVersion: 1, dayKey: key, gameId: options.game.id, gameVersion: options.game.version, completedAt: new Date().toISOString(), ...fields };
    const record = () => engine.record(value);
    let stored;
    try { stored = navigator.locks?.request ? await navigator.locks.request(`katovia:v2:daily:${options.game.id}`, record) : record(); } catch { stored = record(); }
    if (disposed) return null;
    if (dayKey() !== value.dayKey || key !== value.dayKey) { refresh(); return null; }
    result = stored.result; if (!stored.existing) track('game_complete', payload()); render(); return result;
  }
  async function share(method) {
    if(method==='challenge'&&options.game.id!=='reaction')return;
    if (!result || sharing) return; sharing = true; track('share_opened', { ...payload(), channel: method==='challenge'?'native':method });
    if(method==='challenge')track('duel_created',{game_id:'reaction',mode:'duel'});
    const score=Math.round(result.actualMs);const value = method==='challenge'?{title:'Katovia Reaction Duel',text:t('daily.challengeText',{score}),url:'https://katovia.com/d/?id='+encodeTarget(score)}:shareResult(result);
    const outcome = method === 'clipboard' ? await copyText(`${value.text}\n${value.url}`) : await shareText(value);
    if (!disposed) {
      status.textContent = t(`game.feedback.${outcome.status}`); manual.hidden = outcome.status !== 'manual';
      if (outcome.status === 'manual') { manual.value = outcome.text; manual.focus(); manual.select(); }
      if (['copied', 'handoff'].includes(outcome.status)) track('share_completed', { ...payload(), channel: outcome.status === 'copied' ? 'clipboard' : 'native', outcome: outcome.status });
    }
    sharing = false;
  }
  listen(root.querySelector('[data-session-share]'), 'click', () => void share('native'));
  listen(root.querySelector('[data-session-copy]'), 'click', () => void share('clipboard'));
  listen(root.querySelector('[data-session-challenge]'),'click',()=>void share('challenge'));
  listen(document, 'visibilitychange', () => { if (document.hidden) onInterrupt(); else refresh(); });
  listen(window, 'blur', onInterrupt); listen(window, 'focus', refresh); listen(window, 'storage', refresh);
  const unsubscribe = i18n.subscribe(render); schedule(); track('daily_view', payload());
  return { get key() { return key; }, get result() { return result; }, render, commit, start() { refresh(); if (!result) track('game_start', payload()); }, dispose() { disposed = true; clearTimeout(timer); listeners.forEach((fn) => fn()); unsubscribe(); onInterrupt(); } };
}
export function sessionMarkup() {
  return `<p class="eyebrow" data-session-day></p><p data-session-status role="status" aria-live="polite"></p><p class="eyebrow" data-session-streak></p><div data-session-actions hidden><button class="button" data-session-share data-i18n="share.result">SHARE RESULT</button> <button class="button" data-session-copy data-i18n="share.copy">COPY</button><button class="button" data-session-challenge data-i18n="daily.challenge" hidden>CHALLENGE WITH THIS SCORE</button><a class="button daily-next" data-session-next href="/play/particle-universe/">NEXT PLAY</a></div><textarea data-session-manual hidden readonly aria-label="Share text"></textarea>`;
}

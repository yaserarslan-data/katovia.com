import { createReaction, randomDelay, engineOptions } from './logic.js';
import { dailySession, sessionMarkup } from '../../features/daily-session.js';
import { t } from '../../i18n/index.js';
export function markup() { return `<section class="activity-panel" data-reaction-mount><h2 data-i18n="reaction.title">REACTION</h2><p data-i18n="reaction.instructions">Wait for the signal. Then tap as fast as you can. Early taps do not consume your daily.</p><button class="reaction-pad" data-reaction-action type="button">READY</button><p data-reaction-result role="status" aria-live="polite"></p>${sessionMarkup()}</section>`; }
export function mount(root) {
  let attempt = createReaction(); let timer; let frame; let saving = false; let disposed = false;
  const button = root.querySelector('[data-reaction-action]');
  const interrupt = () => { if (attempt.interrupt()) { clearTimeout(timer); cancelAnimationFrame(frame); render(); } };
  const render = (result = session.result) => {
    if (disposed) return;
    button.hidden = !!result; button.disabled = saving;
    button.dataset.state = attempt.state; button.textContent = t(`reaction.${attempt.state}`);
    root.querySelector('[data-reaction-result]').textContent = result ? `${result.actualMs.toFixed(0)} ms` : ['early', 'interrupted'].includes(attempt.state) ? t(`reaction.${attempt.state}`) : '';
  };
  const session = dailySession(root, engineOptions, { onInterrupt: interrupt, onRender: render, shareResult: (result) => ({ title: t('reaction.title'), text: `KATOVIA DAILY · ${t('reaction.title')}\n${result.dayKey}\n⚡ ${result.actualMs.toFixed(0)} ms`, url: 'https://katovia.com/today/#reaction' }) });
  async function activate(event) {
    if (event?.repeat || saving || disposed || session.result || document.hidden || !document.hasFocus()) return;
    if (['ready','early','interrupted'].includes(attempt.state)) {
      session.start(); if (session.result) return;
      attempt.start(); render();
      timer = setTimeout(() => { frame = requestAnimationFrame(() => { if (!disposed && !document.hidden && document.hasFocus() && attempt.signal()) render(); }); }, randomDelay());
    } else {
      const result = attempt.tap(); clearTimeout(timer); cancelAnimationFrame(frame); render();
      if (result && !result.early) { saving = true; button.disabled = true; try { await session.commit(result); } finally { saving = false; render(); } }
    }
  }
  const pointer = (event) => { if (event.button !== 0 || event.isPrimary === false) return; event.preventDefault(); button.focus({ preventScroll: true }); void activate(); };
  const key = (event) => { if (['Enter',' '].includes(event.key)) { event.preventDefault(); void activate(event); } };
  const click = (event) => { if (!event.detail) void activate(); };
  button.addEventListener('pointerdown', pointer); button.addEventListener('keydown', key); button.addEventListener('click', click);
  session.render(); return { dispose() { disposed = true; clearTimeout(timer); cancelAnimationFrame(frame); session.dispose(); button.removeEventListener('pointerdown', pointer); button.removeEventListener('keydown', key); button.removeEventListener('click', click); } };
}

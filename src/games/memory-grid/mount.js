import { dailyPattern, scoreMemory, memoryTiles, engineOptions } from './logic.js';
import { dailySession, sessionMarkup } from '../../features/daily-session.js';
import { t, i18n } from '../../i18n/index.js';
export function markup() { return `<section class="activity-panel" data-memory-mount><h2 data-i18n="memory.title">MEMORY GRID</h2><p data-i18n="memory.instructions">Remember the glowing cells. Select them after they disappear.</p><button class="button button-accent" data-memory-start data-i18n="game.start">START</button><div class="memory-grid" data-memory-grid></div><button class="button" data-memory-submit data-i18n="memory.submit" hidden>SUBMIT</button><p data-memory-result role="status"></p>${sessionMarkup()}</section>`; }
export function mount(root) {
  let state = 'idle'; let selection = new Set(); let timer; let disposed = false; let saving = false;
  const grid = root.querySelector('[data-memory-grid]'); const start = root.querySelector('[data-memory-start]'); const submit = root.querySelector('[data-memory-submit]');
  function interrupt() { if (['showing', 'selecting'].includes(state)) { clearTimeout(timer); state = 'idle'; selection.clear(); render(); root.querySelector('[data-session-status]').textContent = t('game.feedback.interrupted'); } }
  function render(result = session.result) {
    if (disposed) return;
    const settings = dailyPattern(session.key); start.hidden = !!result || state !== 'idle'; submit.hidden = !!result || state !== 'selecting'; submit.disabled = saving;
    grid.style.setProperty('--grid-size', settings.size); grid.replaceChildren();
    for (let i = 0; i < settings.size ** 2; i++) {
      const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'memory-cell'; cell.dataset.cell = i;
      cell.setAttribute('aria-label', t('memory.cell', { value: i + 1 })); cell.setAttribute('aria-pressed', String(selection.has(i)));
      cell.disabled = state !== 'selecting' || !!result || saving;
      cell.dataset.glow = String(state === 'showing' && settings.pattern.includes(i)); grid.append(cell);
    }
    root.querySelector('[data-memory-result]').textContent = result ? t('memory.result', result) : t(`memory.${state}`, { cells: state === 'showing' ? settings.pattern.map((cell) => cell + 1).join(', ') : '' });
  }
  const session = dailySession(root, engineOptions, { onInterrupt: interrupt, onRender: render, shareResult: (result) => ({ title: t('memory.title'), text: `KATOVIA DAILY · ${t('memory.title')}\n${result.dayKey}\n${memoryTiles(result)}\n${result.hits}/${result.total} · ${result.accuracy}%`, url: 'https://katovia.com/today/#memory-grid' }) });
  const onStart = () => { session.start(); if (session.result || state !== 'idle' || document.hidden) return; selection.clear(); state = 'showing'; render(); timer = setTimeout(() => { if (!disposed) { state = 'selecting'; render(); grid.querySelector('button').focus({ preventScroll: true }); } }, dailyPattern(session.key).revealMs); };
  const onGrid = (event) => { const cell = event.target.closest('[data-cell]'); if (!cell || state !== 'selecting' || saving) return; const value = Number(cell.dataset.cell); if (selection.has(value)) selection.delete(value); else selection.add(value); cell.setAttribute('aria-pressed', String(selection.has(value))); };
  const onSubmit = async () => { if (state !== 'selecting' || saving) return; saving = true; state = 'saving'; submit.disabled = true; try { await session.commit({ selection: [...selection], ...scoreMemory(session.key, [...selection]) }); } finally { saving = false; if (!session.result) state = 'idle'; render(); } };
  start.addEventListener('click', onStart); grid.addEventListener('click', onGrid); submit.addEventListener('click', onSubmit); session.render();
  return { dispose() { disposed = true; clearTimeout(timer); session.dispose(); start.removeEventListener('click', onStart); grid.removeEventListener('click', onGrid); submit.removeEventListener('click', onSubmit); } };
}

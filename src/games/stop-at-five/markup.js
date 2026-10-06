import { translate } from '../../i18n/index.js';
const text = (key) => `<span data-i18n="${key}">${translate('en', key)}</span>`;
export function gameMarkup() {
  return `<section class="daily-panel game-panel" data-daily-mount data-state="idle" aria-labelledby="game-title">
    <div class="game-topline"><span class="eyebrow">${text('nav.today')} <span data-game-day>${text('daily.utc')}</span></span><span class="pill">${text('daily.single')}</span></div>
    <div class="game-stage">
      <div class="game-halo" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="game-content">
        <h2 id="game-title" class="game-title"><span data-target-number data-i18n="game.title">${translate('en', 'game.title')}</span></h2>
        <p id="game-instructions" class="game-instructions" data-instructions>${text('game.instructions.idle')}</p>
        <div class="game-result" data-result hidden>
          <p class="result-number" data-actual></p><p class="result-difference" data-difference></p>
          <p class="result-quality" data-quality></p><p class="result-precision" data-precision></p>
        </div>
        <button class="game-action" type="button" data-game-action aria-describedby="game-instructions" disabled>${text('game.start')} <span aria-hidden="true">↗</span></button>
        <p class="game-feedback" data-feedback role="status" aria-live="polite" aria-atomic="true">${text('game.preparing')}</p>
        <noscript><p>${text('game.noscript')}</p></noscript>
      </div>
    </div>
    <div class="game-bottomline"><span class="eyebrow" data-streak>${translate('en', 'daily.streak', { count: 0 })}</span><span class="eyebrow" data-return>${text('daily.return')}</span></div>
    <div class="result-actions" data-result-actions hidden>
      <label class="score-option"><input type="checkbox" data-include-score checked> ${text('share.includeScore')}</label>
      <div class="share-buttons"><button class="button button-accent" type="button" data-share>${text('share.result')} <span aria-hidden="true">↗</span></button><button class="button" type="button" data-copy>${text('share.copy')}</button></div>
      <a class="button daily-next" href="/today/#memory-grid" data-i18n="daily.next.memory">TRY MEMORY GRID</a><p class="share-feedback" data-share-feedback role="status" aria-live="polite"></p>
      <label class="manual-share" data-manual hidden>${text('share.manualLabel')}<textarea data-share-text readonly rows="8" data-i18n-label="share.textLabel" aria-label="Copyable result text"></textarea></label>
    </div>
  </section>`;
}

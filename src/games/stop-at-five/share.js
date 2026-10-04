import { i18n, translate } from '../../i18n/index.js';
import { getDailyConfig } from '../../engines/daily.js';
import { gameConfig } from './config.js';
import { scoreAttempt } from './logic.js';

export function resultShare(result, { includeScore = true, locale = i18n.locale } = {}) {
  const t = (key, params) => translate(locale, key, params);
  const score = scoreAttempt(result.actualMs);
  const number = getDailyConfig(new Date(`${result.dayKey}T00:00:00Z`)).number;
  const delta = ((result.actualMs - gameConfig.targetMs) / 1000).toFixed(2);
  const signed = Number(delta) >= 0 ? `+${delta}` : delta;
  return {
    title: t('share.title'),
    text: [t('share.header', { number: String(number).padStart(3, '0') }), t('share.preview', { day: result.dayKey }),
      '', score.tiles, `⚡ ${t(`game.quality.${score.quality}`)}${score.exact ? ' 5.00' : ''}`,
      ...(includeScore ? [`⏱️ ${(result.actualMs / 1000).toFixed(2)} ${t('share.seconds')}`, `${signed}s`] : [])].join('\n'),
    url: gameConfig.shareUrl,
  };
}

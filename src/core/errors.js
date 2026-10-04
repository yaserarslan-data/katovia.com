import { t } from '../i18n/index.js';
// Only an application-defined code/message may reach UI/logs. Never log payloads.
export function reportError(code, { target, message = t('error.retry'), debug = false, logger = console } = {}) {
  const safeCode = /^[a-z0-9_-]{1,48}$/i.test(code) ? code : 'unexpected_error';
  if (target) {
    target.textContent = message;
    target.dataset.state = 'error';
  }
  if (debug) logger.warn(`[Katovia] ${safeCode}`);
  return safeCode;
}

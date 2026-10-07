import { storage } from '../core/storage.js';
import { messages } from './messages.js';

export const supportedLocales = Object.freeze(['tr', 'en']);
const valid = (value) => supportedLocales.includes(value);
export function detectLocale(stored, browserLanguage = '') {
  return valid(stored) ? stored : /^tr(?:-|$)/i.test(browserLanguage) ? 'tr' : 'en';
}
export function translate(locale, key, params = {}, registry = messages) {
  const lookup = (lang) => Object.hasOwn(registry[lang] || {}, key) && typeof registry[lang][key] === 'string' ? registry[lang][key] : undefined;
  const template = lookup(locale) ?? lookup('en') ?? `[${key}]`;
  return template.replace(/\{([\w]+)\}/g, (match, name) => Object.hasOwn(params, name) ? String(params[name]) : match);
}
export function createI18n({ backend = storage, browserLanguage = globalThis.navigator?.language } = {}) {
  let locale = detectLocale(backend.get('locale'), browserLanguage);
  const listeners = new Set();
  return {
    get locale() { return locale; },
    t: (key, params) => translate(locale, key, params),
    setLocale(next, { persist = true } = {}) {
      if (!valid(next)) return false;
      if (persist) backend.set('locale', next);
      if (next !== locale) { locale = next; listeners.forEach((fn) => fn(locale)); }
      return true;
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    number(value, options) { return new Intl.NumberFormat(locale, options).format(value); },
    date(value, options) { return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(value); },
  };
}
export const i18n = createI18n();
export const t = (key, params) => i18n.t(key, params);

// Only trusted translation strings enter text/attribute sinks, never innerHTML.
export function applyTranslations(root = document) {
  root.documentElement.lang = i18n.locale;
  root.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  root.querySelectorAll('[data-i18n-label]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nLabel)); });
  root.querySelectorAll('[data-i18n-content]').forEach((node) => { node.setAttribute('content', t(node.dataset.i18nContent)); });
  root.querySelectorAll('[data-locale]').forEach((node) => { node.setAttribute('aria-pressed', String(node.dataset.locale === i18n.locale)); });
}

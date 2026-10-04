import { i18n, applyTranslations } from '../i18n/index.js';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/shell.css';
import { mountNavigation } from './navigation.js';
import { track } from '../core/analytics.js';
import { mountDaily } from '../features/today.js';
import { mountActivities } from '../features/activities.js';

document.documentElement.classList.add('js');
applyTranslations();
i18n.subscribe(() => applyTranslations());
document.querySelectorAll('[data-locale]').forEach((button) => button.addEventListener('click', () => i18n.setLocale(button.dataset.locale)));
let disposeNav = mountNavigation();
let daily = mountDaily();
let activity; let activityController = new AbortController();
void mountActivities(document, { signal: activityController.signal }).then((mounted) => { activity = mounted; });
const page = document.body.dataset.page;
track(page === 'home' ? 'home_view' : 'page_view', { route_key: page, app_version: '0_2_0' });
window.addEventListener('pagehide', () => { activityController.abort(); activity?.dispose(); daily?.dispose(); disposeNav(); });
window.addEventListener('pageshow', (event) => {
  if (event.persisted) { disposeNav = mountNavigation(); daily = mountDaily(); activityController = new AbortController(); void mountActivities(document, { signal: activityController.signal }).then((mounted) => { activity = mounted; }); }
});

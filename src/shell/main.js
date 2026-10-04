import { i18n, applyTranslations } from '../i18n/index.js';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/shell.css';
import { mountNavigation } from './navigation.js';
import { track } from '../core/analytics.js';
import { mountDaily } from '../features/today.js';
import { mountDuel } from '../features/duel.js';
import { mountPageShares } from '../features/share-page.js';
import { mountCreator } from '../features/creator.js';
import { mountTools } from '../features/tools.js';
import { mountActivities } from '../features/activities.js';

document.documentElement.classList.add('js');
applyTranslations();
i18n.subscribe(() => applyTranslations());
document.querySelectorAll('[data-locale]').forEach((button) => button.addEventListener('click', () => i18n.setLocale(button.dataset.locale)));
let disposeNav = mountNavigation();
let disposeShares=mountPageShares();
let daily = mountDaily();
let duel, creator, tool, activity, activityController;
function mountAsync(){const controller=new AbortController();activityController=controller;for(const [mount,assign] of [[mountDuel,value=>{duel=value;}],[mountCreator,value=>{creator=value;}],[mountTools,value=>{tool=value;}],[mountActivities,value=>{activity=value;}]])void mount(document,{signal:controller.signal}).then(value=>{if(!controller.signal.aborted)assign(value);else value?.dispose();}).catch(()=>{if(controller.signal.aborted)return;const host=document.querySelector('[data-tool-status]')||document.querySelector('[data-experience]');if(host){const message=document.createElement('p');message.textContent=i18n.t('error.retry');host.append(message);}});}
mountAsync();
const page = document.body.dataset.page;
track(page === 'home' ? 'home_view' : 'page_view', { route_key: page, app_version: '0_2_0' });
window.addEventListener('pagehide', () => { activityController.abort(); tool?.dispose(); creator?.dispose(); duel?.dispose(); activity?.dispose(); daily?.dispose(); disposeNav(); disposeShares(); });
window.addEventListener('pageshow', (event) => {
  if (event.persisted) { disposeNav = mountNavigation(); disposeShares=mountPageShares(); daily = mountDaily(); mountAsync(); }
});

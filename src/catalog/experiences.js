import { translate } from '../i18n/index.js';
function define(id, module) { return Object.freeze({ id, slug:id, type:'play', status:'available', route:`/play/${id}/`, titles:{en:translate('en',`play.${id}.title`),tr:translate('tr',`play.${id}.title`)}, titleKey:`play.${id}.title`, descriptionKey:`play.${id}.description`, seoTitleKey:`play.${id}.seoTitle`, module, activity:true }); }
export const experiences = Object.freeze([define('particle-universe', 'particle-universe'), define('pixel-piano','pixel-piano'),define('koi-pond','koi-pond')]);
export const playBacklog = Object.freeze(['fluid','sand','gravity','neon-trails','rain-room','grow','destroy-this-page']);

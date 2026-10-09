import { translate } from '../i18n/index.js';
// Execution module and public category ownership are independent.
const additions = {'beautiful-quotes':'creative','alphabet-lab':'education','image-compressor':'media','pixel-art-grid':'creative','lucky-draw':'decision'};
const owners = {'beautiful-quotes':'lab','alphabet-lab':'lab','pixel-art-grid':'create'};
export const toolPages = Object.freeze(['beautiful-quotes','alphabet-lab','image-compressor','pixel-art-grid','lucky-draw','json-formatter','text-diff','regex-tester','css-gradient','color-palette'].map(id => Object.freeze({
  id, slug:id, owner:owners[id] || 'tools', category:additions[id] || (['css-gradient','color-palette'].includes(id)?'design':'developer'),
  type:owners[id] || 'tool', status:'available', route:id==='beautiful-quotes'?'/lab/guzel-sozler/':`/tools/${id}/`,
  titles:{tr:translate('tr',`tool.${id}.title`),en:translate('en',`tool.${id}.title`)},
  titleKey:`tool.${id}.title`, descriptionKey:`tool.${id}.description`, seoTitleKey:`tool.${id}.seoTitle`,
  module:additions[id] || 'client', visual:!!additions[id] && !['alphabet-lab','beautiful-quotes'].includes(id), tool:true,
})));
export const tools = Object.freeze(toolPages.filter(entry => entry.owner === 'tools'));
export const discoveryCollections = Object.freeze(toolPages.filter(entry => entry.owner === 'lab'));
export const creativeTools = Object.freeze(toolPages.filter(entry => entry.owner === 'create'));
export const toolGroups = Object.freeze([
  {id:'everyday', ids:['image-compressor','lucky-draw']},
  {id:'design', ids:['color-palette','css-gradient']},
  {id:'text', ids:['text-diff','json-formatter','regex-tester']},
]);
export const relatedProducts = Object.freeze({
  'image-compressor':['color-palette','pixel-art-grid'], 'lucky-draw':['text-diff','image-compressor'],
  'json-formatter':['text-diff','regex-tester'], 'text-diff':['json-formatter','regex-tester'],
  'regex-tester':['json-formatter','text-diff'], 'css-gradient':['color-palette','pixel-art-grid'],
  'color-palette':['css-gradient','pixel-art-grid'], 'pixel-art-grid':['color-palette','image-compressor'],
  'alphabet-lab':['beautiful-quotes','language-forge'], 'beautiful-quotes':['alphabet-lab','language-forge'],
});

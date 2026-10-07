import {quotes,categories} from './model.js';
import {translate} from '../../i18n/index.js';
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(key,tag='span',attrs='')=>`<${tag} data-i18n="quotes.${key}" ${attrs}>${escape(translate('en','quotes.'+key))}</${tag}>`;
export function quoteMarkup(){return `<section class="activity-panel tool-panel quotes-panel" data-tool="beautiful-quotes">
 ${text('languageNote','p','class="tool-hint"')}
 <div class="tool-row" role="group" aria-label="Quote view">${['single','collection','favorites'].map(mode=>`<button type="button" class="button" data-quote-mode="${mode}" aria-pressed="${mode==='single'}">${text(mode)}</button>`).join('')}</div>
 <label>${text('category')}<select data-quote-category><option value="all" data-i18n="quotes.all">${escape(translate('en','quotes.all'))}</option>${categories.map(id=>`<option value="${id}" data-i18n="quotes.category.${id}">${escape(translate('en','quotes.category.'+id))}</option>`).join('')}</select></label>
 <div data-quote-enhanced hidden><p data-quote-count></p><article data-quote-single><p class="quote-text" lang="tr" data-quote-text></p><div class="tool-row">${['previous','random','next','favorite','copy','share'].map(action=>`<button class="button" type="button" data-quote-${action}>${text(action)}</button>`).join('')}</div></article><div class="quote-grid" data-quote-grid hidden></div>
 <p data-quote-empty hidden data-i18n="quotes.empty">${escape(translate('en','quotes.empty'))}</p><label data-quote-manual hidden>${text('manual')}<textarea data-quote-manual-text readonly rows="4"></textarea></label></div>
 <p role="status" data-tool-status></p>
 <section data-quote-static aria-label="Turkish quotes">${quotes.map(quote=>`<article class="quote-static" id="${quote.id}" data-quote-id="${quote.id}"><p lang="tr">${escape(quote.text)}</p></article>`).join('')}</section>
 </section>`;}

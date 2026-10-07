import {profiles,validateDataset} from './model.js';
import {translate} from '../../i18n/index.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(key,tag='span',attrs='')=>`<${tag} data-i18n="${key}" ${attrs}>${escape(translate('en',key))}</${tag}>`;
const bilingual=(values,tag='span',attrs='')=>`<${tag} data-alpha-tr="${escape(values.tr)}" data-alpha-en="${escape(values.en)}" ${attrs}>${escape(values.en)}</${tag}>`;
export function alphabetMarkup(){
 validateDataset();
 return `<section class="activity-panel tool-panel alphabet-lab" data-tool="alphabet-lab">
 ${text('alphabet.intro','p')}<div class="alphabet-enhanced" hidden>
 <div class="alphabet-profile-choices" role="group" aria-label="Profiles" data-i18n-label="alphabet.profiles">${profiles.filter(profile=>profile.systemId!=='braille').map(profile=>bilingual(profile.title,'button',`type="button" class="button" data-alpha-profile="${profile.id}" aria-pressed="false"`)).join('')}${text('alphabet.braille','button','type="button" class="button" data-alpha-system="braille" aria-pressed="false"')}</div>
 <div data-alpha-braille-choices hidden><p>${text('alphabet.brailleChoose')}</p><div class="alphabet-profile-choices" role="group" aria-label="Braille profiles">${profiles.filter(profile=>profile.systemId==='braille').map(profile=>bilingual(profile.title,'button',`type="button" class="button" data-alpha-profile="${profile.id}" aria-pressed="false"`)).join('')}</div></div>
 <label class="alphabet-search">${text('alphabet.search')}<input type="search" data-alpha-search maxlength="100" autocomplete="off" spellcheck="false"></label><p data-alpha-count role="status" aria-live="polite"></p>
 <div class="alphabet-workspace"><div><div data-alpha-grid class="alphabet-grid"></div>${text('alphabet.empty','p','data-alpha-empty hidden')}</div><section class="alphabet-detail" data-alpha-detail tabindex="-1" aria-label="Character" data-i18n-label="alphabet.details">${text('alphabet.choose','p')}</section></div>
 </div><div class="alphabet-reference" data-alpha-reference>
 <nav class="alphabet-reference-links" aria-label="Profiles">${profiles.map(profile=>`<a href="#ref-${profile.id}">${bilingual(profile.title)}</a>`).join('')}</nav>
 ${profiles.map(profile=>`<section id="ref-${profile.id}" data-alpha-static-profile="${profile.id}">${bilingual(profile.title,'h2')}<div class="alphabet-table-scroll"><table><caption>${bilingual(profile.title)} — ${profile.expectedCount}</caption><thead><tr>${['glyph','name'].map(key=>text('alphabet.'+key,'th','scope="col"')).join('')}</tr></thead><tbody>${profile.entries.map(entry=>`<tr id="${entry.id}" data-alpha-static-entry="${entry.id}"><th scope="row" lang="${profile.languageTag}">${escape(entry.forms.map(form=>form.text).join(' / '))}</th><td>${bilingual(entry.label)}</td></tr>`).join('')}</tbody></table></div></section>`).join('')}
 </div><p data-tool-status role="status" aria-live="polite"></p></section>`;
}

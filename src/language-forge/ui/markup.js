import { translate } from '../../i18n/index.js';
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(id,tag='span',attrs='')=>`<${tag} data-i18n="forge.${id}" ${attrs}>${escape(translate('en',`forge.${id}`))}</${tag}>`;
const select=(name,label,values)=>`<label>${text(label)}<select data-forge-${name}>${values.map(([value,key])=>`<option value="${value}" data-i18n="forge.${key}">${escape(translate('en',`forge.${key}`))}</option>`).join('')}</select></label>`;
export function forgeCard(){return `<section class="section-grid"><a class="section-card" href="/create/language-forge/" data-forge-card><div class="section-card-top"><span class="eyebrow">LANGUAGE FORGE</span><span aria-hidden="true">↗</span></div>${text('hero','h2')}${text('cardDescription','p')}${text('cardCta','span','class="pill"')}</a></section>`;}
export function forgeMarkup(){return `<div class="forge" data-forge>
  ${text('fallback','p','data-forge-fallback')}
  <section data-forge-restore hidden>${text('restore','p')}<button type="button" class="button button-accent" data-forge-resume>${text('resume')}</button><button type="button" class="button" data-forge-fresh>${text('new')}</button></section>
  <section data-forge-invalid hidden>${text('invalidShare','p')}<button type="button" class="button" data-forge-invalid-new>${text('new')}</button></section>
  <div data-forge-confirm hidden tabindex="-1" role="group" aria-labelledby="forge-confirm-message"><p id="forge-confirm-message" data-forge-confirm-text></p><button type="button" class="button button-accent" data-forge-confirm-yes>${text('continue')}</button><button type="button" class="button" data-forge-confirm-no>${text('cancel')}</button></div>
  <div data-forge-import-area><button type="button" class="button" data-forge-import>${text('import')}</button><input type="file" data-forge-file accept="application/json,.json" hidden></div>
  <form data-forge-form hidden>
    <fieldset><legend>${text('character')}</legend><div class="forge-presets">${[['flowing','la · meri · nora'],['crisp','krat · tik · por'],['rhythmic','tana · piko · sela'],['clustered','bral · kres · floren']].map(([id,preview],i)=>`<label class="forge-preset"><input type="radio" name="forge-preset" value="${id}" ${i===0?'checked':''}><span class="forge-choice"><strong>${text(id)}</strong>${text(id+'Hint')}<span class="forge-sound" aria-hidden="true">${preview}</span><span class="forge-check" aria-hidden="true">✓</span></span></label>`).join('')}</div>${text('previewNote','p','class="forge-note"')}</fieldset>
    <fieldset><legend>${text('wordLength')}</legend><div class="forge-lengths">${['short','balanced','long'].map(id=>`<label><input type="radio" name="forge-length" value="${id}" ${id==='balanced'?'checked':''}>${text(id)}</label>`).join('')}</div></fieldset>
    <details class="forge-advanced"><summary>${text('adjust')}</summary><div class="forge-rules">${select('order','wordOrder',['SVO','SOV','VSO'].map(x=>[x,x]))}${select('adjective','adjective',[['before','before'],['after','after']])}${select('morphology','morphology',[['particle','particle'],['suffix','suffix']])}</div>${text('particleHint','p')}${text('suffixHint','p')}</details>
    <button class="button button-accent" type="submit" data-forge-submit>${text('forge')}</button>
    ${text('seedPolicy','p','class="forge-note" data-forge-policy hidden')}
  </form>
  <p data-forge-status role="status" aria-live="polite"></p>
  <p data-forge-storage-warning hidden></p>
  <div data-forge-result hidden>
    <p data-forge-receiver hidden>${text('receiver')}</p><button type="button" class="button button-accent" data-forge-copy-project hidden>${text('editCopy')}</button>
    <section class="forge-identity" aria-labelledby="forge-name">${text('created','p','class="eyebrow"')}<h2 id="forge-name" data-forge-name tabindex="-1"></h2><button type="button" class="button" data-forge-rename>${text('rename')}</button><div data-forge-name-editor></div><p data-forge-summary></p><p class="forge-feature-sentence" data-forge-first></p><p data-forge-first-meaning></p></section>
    <section aria-labelledby="forge-quick-heading">${text('quick','h3','id="forge-quick-heading"')}<dl class="forge-quick" data-forge-quick></dl></section>
    <nav class="forge-result-nav" aria-label="Language sections" data-i18n-label="forge.created">${['dictionary','grammar','sentences'].map(id=>`<a class="button" href="#forge-${id}">${text(id)}</a>`).join('')}</nav>
    <section id="forge-dictionary" aria-labelledby="forge-dictionary-title">${text('dictionary','h3','id="forge-dictionary-title"')}<div class="forge-filters"><label>${text('search')}<input type="search" data-forge-search maxlength="100" autocomplete="off"></label>${select('filter','category',['all','pronouns','people','nature','body','daily','actions','qualities','emotions','time','abstract'].map(x=>[x,x]))}</div><p data-forge-count></p><div class="forge-dictionary-head" aria-hidden="true">${text('meaning')}${text('word')}</div><dl data-forge-dictionary class="forge-dictionary"></dl>${text('empty','p','data-forge-empty hidden')}</section>
    <section id="forge-grammar" aria-labelledby="forge-grammar-title">${text('grammar','h3','id="forge-grammar-title"')}<div class="forge-grammar-grid" data-forge-grammar></div></section>
    <section id="forge-sentences" aria-labelledby="forge-sentences-title">${text('sentences','h3','id="forge-sentences-title"')}<div class="forge-sentences" data-forge-sentences></div></section>
    <div class="forge-actions"><button type="button" class="button button-accent" data-forge-share>${text('share')}</button><button type="button" class="button" data-forge-export>${text('export')}</button><button type="button" class="button" data-forge-change>${text('change')}</button><button type="button" class="button" data-forge-new>${text('new')}</button></div><label data-forge-link-area hidden>${text('manualLink')}<input data-forge-link readonly></label><p data-forge-share-budget></p>
    ${text('memory','p','class="forge-note"')}
  </div>
</div>`;}

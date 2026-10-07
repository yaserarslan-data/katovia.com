import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {quotes,validFavorites,selectQuotes} from '../src/tools/quotes/model.js';
test('all fifty restored quotes keep their original texts and stable IDs, with twenty explicitly REVIEW',()=>{
 const text=execFileSync('git',['show','61eaacfcb2a760af2330ab34f7152b4592b1eb8e:laboratuvar/data/guzel-sozler.js'],{encoding:'utf8'}),context={window:{}};vm.runInNewContext(text,context);
 assert.equal(quotes.length,50);assert.equal(quotes.filter(q=>q.rightsStatus==='review').length,20);
 for(const [i,q]of quotes.entries()){assert.equal(q.id,context.window.KATOVIA_BEAUTIFUL_QUOTES[i].id);assert.equal(q.text,context.window.KATOVIA_BEAUTIFUL_QUOTES[i].text);}
 assert.deepEqual(validFavorites([quotes[0].id,'bad',quotes[0].id]),[quotes[0].id]);assert.equal(selectQuotes('sevgi').every(q=>q.categories.includes('sevgi')),true);
});
test('authorized legacy manifest changes do not weaken unrelated legacy protection',async()=>{
 const old=JSON.parse(execFileSync('git',['show','34e4236:scripts/legacy-manifest.json'],{encoding:'utf8'})),next=JSON.parse(await readFile('scripts/legacy-manifest.json','utf8'));
 for(const file of old.files){if(next.authorizedCleanup.changed.includes(file.path)||next.authorizedCleanup.removed.includes(file.path))continue;assert.deepEqual(next.files.find(f=>f.path===file.path),file,file.path);}
 assert.equal(next.files.some(f=>/vendor\/|assets\/apps\//.test(f.path)),false);
});
test('restored route is indexable, accessible without JS and legacy link resolves; Vite notices accompany retained CSS helper',async()=>{
 const html=await readFile('dist/lab/guzel-sozler/index.html','utf8');assert.equal((html.match(/data-quote-id=/g)||[]).length,50);assert.match(html,/https:\/\/katovia.com\/lab\/guzel-sozler\//);assert.ok((await readFile('dist/sitemap.xml','utf8')).includes('https://katovia.com/lab/guzel-sozler/'));
 assert.match(await readFile('dist/laboratuvar/guzel-sozler.html','utf8'),/url=\/lab\/guzel-sozler\//);
 const js=await Promise.all((await readdir('dist/katovia-assets')).filter(f=>f.endsWith('.js')).map(f=>readFile('dist/katovia-assets/'+f,'utf8')));assert.ok(!js.some(b=>b.includes('new MutationObserver')));assert.ok(js.some(b=>b.includes('Vite preload helper: Copyright')));
 assert.match(await readFile('dist/katovia-assets/vite-runtime-LICENSE.txt','utf8'),/Copyright \(c\) 2019-present/);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {entries} from '../src/catalog/registry.js';
import {messages} from '../src/i18n/messages.js';
const retired=JSON.parse(await readFile('scripts/legacy-game-retirements.json','utf8'));
test('exact ten approved games are absent from source, artifact, catalogs and both locales',async()=>{
 assert.equal(retired.paths.length,10);assert.equal(new Set(retired.paths).size,10);
 assert.deepEqual(retired.paths.slice().sort(),['araba-firlat','bilardo','buz-hokeyi','falso-sut','golf-mini-oyun','kus-fotografcisi','serit-kacisi','sut-gol','tas-yagmuru','yuk-ustasi'].map(id=>`oyunlar/${id}.html`).sort());
 const lab=await readFile('dist/lab/index.html','utf8');assert.doesNotMatch(lab,/lab-games|oyunlar\//);assert.equal((lab.match(/data-card-id=/g)||[]).length,9);
 for(const path of retired.paths){await assert.rejects(access(path));await assert.rejects(access(`dist/${path}`));assert.ok(!entries.some(e=>e.route==='/'+path));}
 for(const locale of ['tr','en']){assert.ok(!Object.hasOwn(messages[locale],'lab.games'));for(const id of ['yuk-ustasi','tas-yagmuru','sut-gol','serit-kacisi','kus-fotografcisi','golf','falso-sut','hokey','bilardo','araba-firlat'])assert.ok(!Object.hasOwn(messages[locale],`entry.${id}.title`));}
});
test('retirement preserves every retained manifest hash and current SEO/compatibility',async()=>{
 const before=JSON.parse(execFileSync('git',['show','8aacf18:scripts/legacy-manifest.json'],{encoding:'utf8'})),after=JSON.parse(await readFile('scripts/legacy-manifest.json','utf8'));
 assert.deepEqual(after.files,before.files.filter(f=>!retired.paths.includes(f.path)));assert.deepEqual(retired.files,before.files.filter(f=>retired.paths.includes(f.path)));
 for(const file of ['site/sitemap.xml','site/robots.txt','CNAME','app-ads.txt'])assert.equal(await readFile(file,'utf8'),execFileSync('git',['show',`8aacf18:${file}`],{encoding:'utf8'}));
 const runner=await readFile('scripts/release-pages.py','utf8');assert.match(runner,/Persistent retirement/);assert.match(runner,/update-index','--force-remove',path/);
});

// Metadata fix is independent of the user-facing taxonomy and execution loader.
test('five specialized module identities change without taxonomy or runtime-loader changes',async()=>{
 const {toolPages}=await import('../src/catalog/tools.js');
 const categories={'beautiful-quotes':'creative','alphabet-lab':'education','image-compressor':'media','pixel-art-grid':'creative','lucky-draw':'decision'};
 const owners={'beautiful-quotes':'lab','alphabet-lab':'lab','pixel-art-grid':'create','image-compressor':'tools','lucky-draw':'tools'};
 for(const [id,category] of Object.entries(categories)){const entry=toolPages.find(e=>e.id===id);assert.equal(entry.module,id);assert.equal(entry.category,category);assert.equal(entry.owner,owners[id]);assert.equal(entry.type,owners[id]==='tools'?'tool':owners[id]);}
 assert.equal(execFileSync('git',['diff','--name-only','8aacf18','--','src/features/tools.js'],{encoding:'utf8'}).trim(),'');
});

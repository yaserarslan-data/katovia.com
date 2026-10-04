import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {experiences,playBacklog} from '../src/catalog/experiences.js';
test('PLAY registry owns three real static experiences and separates future backlog',async()=>{
 assert.equal(experiences.length,3);assert.equal(new Set(experiences.map(x=>x.id)).size,3);
 for(const entry of experiences){assert.equal(entry.status,'available');assert.ok(entry.titles.tr&&entry.titles.en);await readFile(`src/play/${entry.module}.js`);const html=await readFile(`dist${entry.route}index.html`,'utf8');assert.ok(html.includes(`https://katovia.com${entry.route}`));assert.ok(html.includes('experience-guide'));assert.ok(html.includes('data-experience'));assert.ok(!playBacklog.includes(entry.id));}
});

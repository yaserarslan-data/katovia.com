import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { mysteries } from '../src/catalog/mysteries.js';
import { loadMystery } from './mysteries.mjs';

const plain = node => typeof node === 'string' ? node : node.children.map(plain).join('');
export function compareMysteryContent(source, translated, path = 'sections') {
  if (typeof source === 'string') {
    assert.equal(typeof translated, 'string', `${path}: text type`);
    if (source.trim()) assert.ok(translated.trim(), `${path}: missing translation`);
    else assert.equal(translated, source, `${path}: formatting`);
    return;
  }
  assert.equal(translated.tag, source.tag, `${path}: semantic tag`);
  assert.deepEqual(translated.attrs, source.attrs, `${path}: anchors, links or attributes`);
  assert.equal(translated.children.length, source.children.length, `${path}: block count`);
  source.children.forEach((child,index) => compareMysteryContent(child,translated.children[index],`${path}/${source.tag}[${index}]`));
}
export async function checkMysteries() {
  assert.equal(new Set(mysteries.map(entry=>entry.id)).size,mysteries.length);
  assert.deepEqual(mysteries.map(entry=>entry.order),Array.from({length:mysteries.length},(_,index)=>index+1));
  const results=[];
  for (const entry of mysteries) {
    assert.match(entry.id,/^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(['explained','partial','open'].includes(entry.status));
    const tr=await loadMystery(entry,'tr'), en=await loadMystery(entry,'en');
    const raw=await readFile(new URL(`../src/content/mysteries/${entry.id}/tr.json`,import.meta.url));
    const original=await readFile(new URL(`../Yeni klasör/Çözülemeyen Dosyalar/${tr.source.filename}`,import.meta.url));
    assert.equal(createHash('sha256').update(original).digest('hex'),tr.source.sha256);
    assert.deepEqual(en.source,tr.source);
    assert.equal(en.editorial.sourceLocale,'tr');
    assert.equal(en.editorial.sourceRevision,tr.source.revision);
    assert.equal(en.editorial.sourceContentSha256,createHash('sha256').update(raw).digest('hex'));
    assert.equal(en.editorial.translationState,'editorial-translation');
    assert.equal(en.editorial.independentlyReviewed,false);
    assert.equal(en.sections.length,tr.sections.length);
    tr.sections.forEach((section,index)=>compareMysteryContent(section,en.sections[index],`${entry.id}/${index}`));
    const trText=tr.sections.map(plain).join('\n'),enText=en.sections.map(plain).join('\n');
    assert.deepEqual(enText.match(/10\.\d{4,9}\/[^\s]+/g),trText.match(/10\.\d{4,9}\/[^\s]+/g));
    const reference=tr.sections.find(section=>['kaynaklar','kaynakca'].includes(section.attrs.id));
    const retainTitles=node=>{
      if(typeof node==='string')return;
      if(node.tag==='li'||(node.attrs.class||'').split(' ').includes('source')){
        for(const match of plain(node).matchAll(/“([^”]+)”/g))assert.ok(enText.includes(match[1]),`${entry.id}: source title changed: ${match[1]}`);
      }
      node.children.forEach(retainTitles);
    };
    retainTitles(reference);
    let blocks=0,texts=0,links=0;
    const count=node=>{if(typeof node==='string'){if(node.trim())texts++;return;}blocks++;if(node.tag==='a')links++;node.children.forEach(count);};
    tr.sections.forEach(count);
    results.push({id:entry.id,order:entry.order,status:entry.status,sections:tr.sections.length,blocks,texts,links});
  }
  return results;
}
if(process.argv[1]?.endsWith('check-mysteries.mjs'))console.log(JSON.stringify(await checkMysteries(),null,2));

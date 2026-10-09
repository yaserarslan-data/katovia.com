import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {messages} from '../src/i18n/messages.js';
import {profiles} from '../src/tools/alphabet/model.js';
test('approved badge and slogan localize while the locked headline and profile inventories remain stable',()=>{
 const old=execFileSync('git',['show','01fdc6d:src/i18n/messages.js'],{encoding:'utf8'}),context={};vm.runInNewContext(old.replace('export const messages =','globalThis.messages ='),context);
 for(const locale of ['tr','en'])for(const key of ['home.play','home.something'])assert.equal(messages[locale][key],context.messages[locale][key]);
 assert.equal(messages.tr['common.motto'],'OYNA. OLUŞTUR. MEYDAN OKU.');
 assert.equal(messages.tr['home.preview'],'MERAK ALANI');assert.equal(messages.en['home.preview'],'SPACE FOR CURIOSITY');assert.equal(messages.tr['home.description'],'Merakını harekete geçir.');assert.equal(messages.en['home.description'],'Put your curiosity into motion.');
 assert.deepEqual(profiles.map(p=>p.expectedCount),[24,33,46,36,29,26]);assert.equal(profiles.find(p=>p.id==='greek-modern').title.tr,'Modern Yunanca');assert.equal(profiles.find(p=>p.id==='morse-international').title.en,'International Morse');
});

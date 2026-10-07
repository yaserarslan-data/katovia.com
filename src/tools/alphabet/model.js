import dataset from './data.json' with { type: 'json' };
export { dataset };
export const profiles=dataset.profiles;
export const profileById=id=>profiles.find(profile=>profile.id===id);
export const entryById=(profile,id)=>profile?.entries.find(entry=>entry.id===id);
export const searchText=value=>String(value).normalize('NFC').toLocaleLowerCase('en').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
export function findEntries(profile,query){
 const exact=String(query).trim().normalize('NFC');
 const token=profile.systemId==='morse'&&/^[a-z]$/i.test(exact)?exact.toUpperCase():profile.systemId==='braille'?exact.toLocaleLowerCase(profile.languageTag):exact;
 // Keep script identity. A mark may not be silently stripped into another glyph.
 const exactForms=profile.entries.filter(entry=>entry.forms.some(form=>form.text===token)||entry.inputToken===token||entry.pattern===exact);
 if(exactForms.length)return exactForms;
 const exactRoman=profile.entries.filter(entry=>entry.romanization?.value.normalize('NFC').toLocaleLowerCase('en')===exact.toLocaleLowerCase('en'));
 if(exactRoman.length)return exactRoman;
 if(exact&&/[^\x00-\x7f]/.test(exact)&&!/[a-zA-Z]/.test(exact))return [];
 const needle=searchText(exact);
 return profile.entries.filter(entry=>searchText([...Object.values(entry.symbolName),...entry.searchAliases,entry.romanization?.value||'',entry.pattern||'',...(entry.dots?[entry.dots.join('-')]:[])].join(' ')).includes(needle));
}
export function readState(url){
 const parsed=new URL(url,'https://katovia.com');
 const profile=profileById(parsed.searchParams.get('profile'));
 let id='';try{id=decodeURIComponent(parsed.hash.slice(1));}catch{}
 const selected=entryById(profile,id);
 return {profileId:profile?.id||null,symbolId:selected?.id||null};
}
export function stateUrl(profileId,symbolId){
 const profile=profileById(profileId),entry=entryById(profile,symbolId);
 return '/tools/alphabet-lab/'+(profile?'?profile='+encodeURIComponent(profile.id):'')+(entry?'#'+entry.id:'');
}
export function validateDataset(data=dataset){
 const expected={'greek-modern':24,'cyrillic-russian':33,'hiragana-basic':46,'morse-international':36,'braille-tr':29,'braille-ueb':26};
 const ids=new Set(),sources=new Set(data.sources.map(source=>source.id));
 if(data.audioEnabled!==false||data.unicodeVersion!=='17.0.0'||data.profiles.length!==6)throw new Error('Unexpected dataset scope');
 let count=0;
 for(const profile of data.profiles){
  if(profile.entries.length!==expected[profile.id]||profile.expectedCount!==expected[profile.id])throw new Error('Profile count mismatch');
  profile.entries.forEach((entry,index)=>{
   if(ids.has(entry.id)||entry.order!==index+1||entry.audio!==null)throw new Error('Invalid identity/order/audio');ids.add(entry.id);count++;
   if(!entry.symbolName.tr||!entry.symbolName.en||!entry.pronunciation.text.tr||!entry.pronunciation.text.en)throw new Error('Missing bilingual field');
   for(const refs of Object.values(entry.sourceRefsByField))for(const ref of refs)if(!sources.has(ref))throw new Error('Unknown source');
   for(const form of entry.forms){
    const cps=[...form.text].map(char=>'U+'+char.codePointAt(0).toString(16).toUpperCase().padStart(4,'0'));
    if(JSON.stringify(cps)!==JSON.stringify(form.codePoints)||form.unicodeNames.length!==cps.length)throw new Error('Glyph/codepoint mismatch');
   }
   if(profile.systemId==='morse'&&(!/^[.-]+$/.test(entry.pattern)||entry.romanization!==null))throw new Error('Invalid Morse record');
   if(profile.systemId==='braille'){
    if(!entry.dots?.length||new Set(entry.dots).size!==entry.dots.length||entry.dots.some(dot=>dot<1||dot>6))throw new Error('Invalid dots');
    const cell=String.fromCodePoint(0x2800+entry.dots.reduce((mask,dot)=>mask|(1<<(dot-1)),0));
    if(entry.forms[0].text!==cell||entry.romanization!==null)throw new Error('Braille cell mismatch');
   }
  });
 }
 if(count!==194)throw new Error('Expected 194 records');
 for(const source of data.sources)if(!/^[a-f0-9]{64}$/.test(source.sha256)||!source.version||!source.reuse||!source.url.startsWith('https://'))throw new Error('Incomplete source provenance');
 return {profiles:6,records:count,counts:expected};
}

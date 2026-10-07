import {profiles,dataset} from './inventory.js';
export {profiles,dataset};
export const profileById=id=>profiles.find(profile=>profile.id===id);
export const entryById=(profile,id)=>profile?.entries.find(entry=>entry.id===id);
const fold=value=>String(value).normalize('NFC').toLocaleLowerCase('en').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
export function findEntries(profile,query){
 const exact=String(query).trim().normalize('NFC');
 if(!exact)return profile.entries;
 const token=profile.systemId==='morse'&&/^[a-z]$/i.test(exact)?exact.toUpperCase():exact;
 const exactEntries=profile.entries.filter(entry=>entry.forms.some(form=>form.text===token)||Object.values(entry.label).some(label=>label===token));
 if(exactEntries.length)return exactEntries;
 if(profile.systemId==='braille'&&[...exact].length===1){const name=exact.toLocaleLowerCase(profile.languageTag);const match=profile.entries.filter(entry=>entry.label.en===`Letter ${name}`);if(match.length)return match;}
 if(/[^\x00-\x7f]/.test(exact)&&!/[a-zA-Z]/.test(exact))return [];
 return profile.entries.filter(entry=>fold(Object.values(entry.label).join(' ')).includes(fold(exact)));
}
export function readState(url){
 const parsed=new URL(url,'https://katovia.com'),profile=profileById(parsed.searchParams.get('profile'));
 let id='';try{id=decodeURIComponent(parsed.hash.slice(1));}catch{}
 return {profileId:profile?.id||null,symbolId:entryById(profile,id)?.id||null};
}
export function stateUrl(profileId,symbolId){
 const profile=profileById(profileId),entry=entryById(profile,symbolId);
 return '/tools/alphabet-lab/'+(profile?'?profile='+encodeURIComponent(profile.id):'')+(entry?'#'+entry.id:'');
}
export function validateDataset(data=dataset){
 const expected={'greek-modern':24,'cyrillic-russian':33,'hiragana-basic':46,'morse-international':36,'braille-tr':29,'braille-ueb':26};
 const ids=new Set();let count=0;
 if(data.profiles.length!==6||new Set(data.profiles.map(p=>p.id)).size!==6)throw new Error('Expected six profiles');
 for(const profile of data.profiles){
  if(profile.expectedCount!==expected[profile.id]||profile.entries.length!==expected[profile.id])throw new Error('Profile count mismatch');
  profile.entries.forEach((entry,index)=>{
   if(ids.has(entry.id)||entry.profileId!==profile.id||entry.order!==index+1||!entry.character||!entry.label.tr||!entry.label.en)throw new Error('Invalid character record');
   const allowed=new Set(['id','profileId','order','character','forms','label']);
   if(Object.keys(entry).some(key=>!allowed.has(key))||entry.forms.some(form=>Object.keys(form).some(key=>!['role','text'].includes(key))||!form.text))throw new Error('Unexpected character inventory fields');
   ids.add(entry.id);count++;
  });
 }
 if(count!==194)throw new Error('Expected 194 characters');
 return {profiles:6,records:count,counts:expected};
}
